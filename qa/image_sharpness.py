import os
from playwright.sync_api import sync_playwright
B=os.environ.get("QA_BASE","http://localhost:4325")
JS="""async()=>{const out=[];for(const i of document.images){const r=i.getBoundingClientRect();if(!(i.complete&&r.width>60&&i.currentSrc))continue;
 try{const b=await (await fetch(i.currentSrc)).blob();const bm=await createImageBitmap(b);out.push({cls:(i.className||i.parentElement.className||'').toString().slice(0,32),alt:(i.alt||'').slice(0,26),shown:Math.round(r.width),px:bm.width,file:i.currentSrc.split('/').pop().slice(0,34)});}catch(e){}}return out}"""
pages=["/","/oregon-fishing-charter-rates","/trips/full-day-drift-boat","/trips/crabbing-charter-alumaweld","/oregon-fishing-species","/oregon-fishing-charter-photos","/captain-clinton-mcculloch-of-oregon","/oregon-fishing-reports"]
seen={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,dpr in ((390,3),(820,2),(1440,2),(1920,1)):
        pg=b.new_context(viewport={"width":w,"height":900},device_scale_factor=dpr).new_page()
        for u in pages:
            pg.goto(B+u,wait_until="networkidle"); H=pg.evaluate("document.documentElement.scrollHeight"); y=0
            while y<H: pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(80); y+=700
            pg.wait_for_timeout(500)
            for r in pg.evaluate(JS):
                need=r["shown"]*dpr; ratio=r["px"]/need
                if ratio<0.9: seen[(w,dpr,u,r["cls"],r["alt"])]=(r["shown"],r["px"],round(ratio,2))
    b.close()
print("soft images:",len(seen))
for k,v in sorted(seen.items(),key=lambda kv:kv[1][2])[:30]: print(k,"shown",v[0],"file px",v[1],"ratio",v[2])
