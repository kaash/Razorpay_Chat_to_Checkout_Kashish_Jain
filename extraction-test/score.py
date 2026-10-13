import re
import json,sys
cases={c['id']:c for c in json.load(open('cases.json'))['cases']}
exp=json.load(open('expected.json'))
TH_F=0.85; TH_P=0.80; MARGIN=0.15
AMBIG_RULE='--rule' in sys.argv
CAT={i['item_id']:i for i in json.load(open('cases.json'))['catalogue']}
def chat_text(c): return ' '.join(m['text'] for m in c['messages']).lower()
def span_ok(q,c): return bool(q) and q.lower().strip(' ?.') in chat_text(c)
def ctx_val(c,item_id,key):
    o=c.get('context_paid_order')
    if not o: return None
    for it in o['items']:
        if it['item_id']==item_id: return it[key if key!='qty' else 'qty']
    return None
def run(model):
    out={o['id']:o for o in json.load(open(model+'.json'))}
    tally={'correct':0,'correct_flag':0,'overflag':0,'caught_error':0,'silent':0}
    rows=[]
    for cid,e in exp.items():
        o=out[cid]; c=cases[cid]; res=[]
        def add(field,cat,note=''):
            tally[cat]+=1; res.append(f"{field}:{cat}{('('+note+')') if note else ''}")
        # intent
        action=o['intent'] in ('agreed','change','return')
        acc_int = o['intent_confidence']>=TH_F and (span_ok(o.get('intent_quote'),c)) if action else True
        right = o['intent']==e['intent']
        if not action:
            add('intent','correct' if right else 'caught_error', o['intent'])
        elif acc_int: add('intent','correct' if right else 'silent', o['intent'])
        else: add('intent','overflag' if right else 'caught_error', f"{o['intent']} {o['intent_confidence']}")
        # multiple customers
        if e['special']=='multiple_customers':
            add('multi_customer','correct_flag' if o['multiple_customers'] else 'silent'); rows.append((cid,res)); continue
        elif o['multiple_customers']:
            add('multi_customer','caught_error')
        # price request
        if e['price_requested']:
            pr=o.get('price_requested'); add('price_request','correct_flag' if pr and pr['value']==e['price_requested'] else 'silent')
        # items
        if e['items']:
            for (eid,esz,eq) in e['items']:
                # find matching model item
                cand=None
                for it in o['items']:
                    if eid in ('AMBIG','NOT_FOUND'): cand=it;break
                    if it['candidates'] and it['candidates'][0]['item_id']==eid: cand=it;break
                if cand is None:
                    cand=o['items'][0] if o['items'] else None
                if cand is None: add('item','caught_error','missing'); continue
                cs=sorted(cand['candidates'],key=lambda x:-x['score'])
                top=cs[0] if cs else None; second=cs[1]['score'] if len(cs)>1 else 0
                acc_item = bool(top) and top['score']>=TH_P and top['score']-second>=MARGIN and not cand.get('not_found')
                if AMBIG_RULE and acc_item and 'shared image' not in chat_text(c):
                    words=set(re.findall(r'[a-z]+',cand['mention'].lower()))
                    hits=[k for k,v in CAT.items() if words & set(re.findall(r'[a-z]+',v['colour']))]
                    named=[k for k,v in CAT.items() if all(w in cand['mention'].lower() for w in v['name'].lower().split()[:2])]
                    if len(hits)>1 and not named and not c.get('context_paid_order'): acc_item=False
                if eid=='NOT_FOUND': add('item','correct_flag' if cand.get('not_found') else ('silent' if acc_item else 'correct_flag'))
                elif eid=='AMBIG': add('item','correct_flag' if not acc_item else 'silent',f"picked {top['item_id']} {top['score']} vs {second}")
                else:
                    r= top and top['item_id']==eid
                    add('item',('correct' if r else 'silent') if acc_item else ('overflag' if r else 'caught_error'))
                iid=top['item_id'] if top else None
                for key,ev in (('size',esz),('qty',eq)):
                    f=cand[key]; v=f['value']; conf=f.get('confidence') or 0
                    src_ok = span_ok(f.get('quote'),c) or (v is not None and ctx_val(c,iid,key)==v) or (key=='size' and v=='Free')
                    acc = v is not None and conf>=TH_F and src_ok
                    if ev is None and key=='size':  # expected missing
                        add(key,'correct_flag' if not acc else 'silent'); continue
                    r = v==ev
                    add(key,('correct' if r else 'silent') if acc else ('overflag' if r else ('correct_flag' if (key=='qty' and v is None and e['special']=='size_missing') else 'caught_error')), f"{v} c={conf}")
        # code-level specials
        if e['special'] in ('outside_window_code','no_paid_order_code'):
            add('code_rule','correct_flag','handled by code, not AI')
        rows.append((cid,res))
    return tally,rows
for m in ('haiku','sonnet'):
    t,rows=run(m)
    print('=== ',m, t, 'total',sum(t.values()))
    for cid,res in rows: print(cid,' | '.join(res))

if '--cases' in sys.argv:
    for m in ('haiku','sonnet'):
        t,rows=run(m)
        clean=sum(1 for _,r in rows if all(x.split(':')[1].startswith('correct') and not x.split(':')[1].startswith('correct_flag') for x in r))
        silent=sum(1 for _,r in rows if any(':silent' in x for x in r))
        flagged=len(rows)-clean-silent
        over=sum(1 for _,r in rows if any(':overflag' in x for x in r))
        print(m,'cases',len(rows),'clean',clean,'flagged',flagged,'(of which over-flag',over,')','silent',silent)
