/* ============================================================
   Núcleo de geração de crachás (ZPL + preview)
   Compartilhado por index.html (operador) e admin.html (recepção).

   Não depende de nenhum elemento da página nem de variáveis
   globais: tudo o que varia entra por parâmetro (opts).
   ============================================================ */
(function (global) {
  'use strict';

  const DPMM = 8;                       // 203 dpi ≈ 8 dots/mm
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mm2dots = mm => Math.round((Number(mm) || 0) * DPMM);
  const san = v => (v == null ? '' : String(v));

  /* ---------- Nome: primeiro nome + primeiro sobrenome, sem duplicar ---------- */
  const NAME_CONNECTORS = new Set(['da','de','do','dos','das','e','di','del','della','van','von','la','le','el','y','du','den','der']);

  function nameParts(full){
    const toks = san(full).trim().split(/\s+/).filter(Boolean);
    if(!toks.length) return {first:'', surnames:[]};
    const surnames = toks.slice(1).filter(t => !NAME_CONNECTORS.has(t.toLowerCase()));
    return {first:toks[0], surnames};
  }

  // "Maria Alves da Silva" -> "Maria Alves"
  function shortName(full){
    const {first, surnames} = nameParts(full);
    if(!first) return '';
    return surnames.length ? `${first} ${surnames[0]}` : first;
  }

  // candidatos em ordem de preferência, para desempatar nomes iguais
  function shortNameCandidates(full){
    const {first, surnames} = nameParts(full);
    if(!first) return [''];
    if(!surnames.length) return [first];
    const last = surnames[surnames.length-1];
    const c = [
      `${first} ${surnames[0]}`,            // primeiro + 1º sobrenome
      `${first} ${last}`,                   // primeiro + último sobrenome
      `${first} ${surnames[0]} ${last}`,    // primeiro + 1º + último
      [first, ...surnames].join(' '),       // nome completo (sem conectores)
    ];
    return [...new Set(c)];
  }

  // Resolve uma lista de nomes completos em nomes curtos e ÚNICOS.
  function resolveDisplayNames(fulls){
    const taken = new Set();
    return fulls.map(full=>{
      const cands = shortNameCandidates(full);
      let chosen = cands.find(c => c && !taken.has(c.toLowerCase()));
      if(!chosen){
        const base = cands[cands.length-1] || san(full).trim() || 'Sem nome';
        let n = 2; chosen = base;
        while(taken.has(chosen.toLowerCase())) chosen = `${base} ${n++}`;
      }
      taken.add(chosen.toLowerCase());
      return chosen;
    });
  }

  /* ---------- Medição de fonte (para deixar o nome o maior possível) ---------- */
  let _measCtx;
  function fontWidthRatio(text, bold){
    if(!_measCtx) _measCtx = document.createElement('canvas').getContext('2d');
    _measCtx.font = `${bold?'bold ':''}100px Arial, sans-serif`;
    return _measCtx.measureText(text || ' ').width / 100;   // largura por 1px de altura
  }
  function fitFontToWidth(text, blockW, bold){
    const r = fontWidthRatio(text, bold);
    return r > 0 ? Math.floor(blockW / r) : 999;
  }

  /* ============================================================
     LAYOUT — fonte única de verdade p/ ZPL e preview.
     Devolve uma lista de elementos medidos em "dots".
     opts: {dark, border, symbology}
     ============================================================ */
  function buildLayout(tpl, d, W, H, opts){
    opts = opts || {};
    const els = [];
    const margin = Math.round(W*0.05);
    const blockW = W - margin*2;
    const dark = !!opts.dark && tpl === 'texto';   // tema escuro só no crachá de texto

    if(dark) els.push({type:'bg', x:0, y:0, w:W, h:H});
    if(opts.border && !dark){
      els.push({type:'box', x:6, y:6, w:W-12, h:H-12, thickness:3});
    }

    if(tpl === 'texto'){
      // NOME grande e em negrito (o maior possível pela largura), com EMPRESA e CARGO menores.
      const nome = san(d.nome).trim() || ' ';
      const subs = [san(d.empresa).trim(), san(d.cargo).trim()].filter(Boolean);
      const nLines = 1 + subs.length;
      const marginY = Math.round(H*0.06);
      const avail = H - 2*marginY;
      const gap = Math.round(H*0.045);

      const widthFit = fitFontToWidth(nome, blockW*0.92, true);
      const heightCap = Math.round(avail * (subs.length ? 0.62 : 1.0));
      let nameFont = clamp(Math.min(widthFit, heightCap), 24, 220);
      let subFont = subs.length ? clamp(Math.round(Math.min(nameFont*0.45, avail*0.22)), 16, 64) : 0;

      let total = nameFont + subs.length*subFont + gap*(nLines-1);
      if(total > avail){                       // reduz proporcional se não couber
        const k = avail/total;
        nameFont = Math.floor(nameFont*k);
        subFont = Math.floor(subFont*k);
        total = nameFont + subs.length*subFont + gap*(nLines-1);
      }

      let y = Math.max(marginY, Math.round((H - total)/2));
      els.push({type:'text', x:margin, y, font:nameFont, blockW, align:'C', text:nome, upper:true, bold:true, reverse:dark, maxlines:1});
      y += nameFont + gap;
      for(const s of subs){
        els.push({type:'text', x:margin, y, font:subFont, blockW, align:'C', text:s, upper:true, reverse:dark, maxlines:1});
        y += subFont + gap;
      }
    }

    else if(tpl === 'qr'){
      const nomeFont = clamp(Math.round(H*0.13), 26, 72);
      els.push({type:'text', x:margin, y:Math.round(H*0.09), font:nomeFont, blockW, align:'C', text:san(d.nome)});
      const mag = clamp(Math.round(Math.min(W,H)/55), 3, 10);
      const est = mag*29; // estimativa do tamanho do QR em dots
      const qx = clamp(Math.round((W - est)/2), margin, W);
      const qy = Math.round(H*0.33);
      els.push({type:'qr', x:qx, y:qy, mag, est, data:san(d.qrdata)});
      const legenda = san(d.legenda).trim();
      if(legenda){
        els.push({type:'text', x:margin, y:H - Math.round(H*0.16), font:clamp(Math.round(H*0.08),20,42),
                  blockW, align:'C', text:legenda});
      }
    }

    else if(tpl === 'codigobarras'){
      const nomeFont = clamp(Math.round(H*0.14), 26, 72);
      els.push({type:'text', x:margin, y:Math.round(H*0.11), font:nomeFont, blockW, align:'C', text:san(d.nome)});
      const bx = Math.round(W*0.12);
      const by = Math.round(H*0.44);
      const bh = clamp(Math.round(H*0.30), 50, 220);
      els.push({type:'barcode', x:bx, y:by, height:bh, blockW:W-2*bx, data:san(d.codigo), symbology:opts.symbology || 'CODE128'});
      const legenda = san(d.legenda).trim();
      if(legenda){
        els.push({type:'text', x:margin, y:H - Math.round(H*0.13), font:clamp(Math.round(H*0.075),18,38),
                  blockW, align:'C', text:legenda});
      }
    }

    return els;
  }

  /* ---------- ZPL ---------- */
  function zplEscape(s){ return String(s).replace(/[\^~\\]/g, ' '); }
  function onlyDigits(s){ return String(s).replace(/\D/g,''); }

  function layoutToZPL(layout, W, H, copies){
    let z = '^XA\n^CI28\n^PW' + W + '\n^LL' + H + '\n^LH0,0\n';
    for(const e of layout){
      if(e.type === 'bg'){
        z += `^FO${e.x},${e.y}^GB${e.w},${e.h},${Math.max(e.w,e.h)},B^FS\n`;
      } else if(e.type === 'box'){
        z += `^FO${e.x},${e.y}^GB${e.w},${e.h},${e.thickness}^FS\n`;
      } else if(e.type === 'text'){
        const t = zplEscape(e.upper ? e.text.toUpperCase() : e.text);
        const fr = e.reverse ? '^FR' : '';
        const ml = e.maxlines || 2;
        const field = (dx,dy)=> `^FO${e.x+dx},${e.y+dy}^A0N,${e.font},${e.font}^FB${e.blockW},${ml},0,${e.align||'L'},0${fr}^FD${t}^FS\n`;
        if(e.bold && !e.reverse){
          // negrito "falso": imprime em 4 posições deslocadas para engrossar o traço
          const o = Math.max(1, Math.round(e.font/55));
          z += field(0,0) + field(o,0) + field(0,o) + field(o,o);
        } else {
          z += field(0,0);   // no fundo preto (reverse) usa 1 passada para não anular o ^FR
        }
      } else if(e.type === 'qr'){
        z += `^FO${e.x},${e.y}^BQN,2,${e.mag}^FDLA,${zplEscape(e.data)}^FS\n`;
      } else if(e.type === 'barcode'){
        if(e.symbology === 'EAN13'){
          z += `^FO${e.x},${e.y}^BY2^BEN,${e.height},Y,N^FD${onlyDigits(e.data)}^FS\n`;
        } else {
          z += `^FO${e.x},${e.y}^BY2^BCN,${e.height},Y,N,N^FD${zplEscape(e.data)}^FS\n`;
        }
      }
    }
    z += '^PQ' + Math.max(1, Number(copies)||1) + '\n^XZ';
    return z;
  }

  /* Atalho usado pela recepção: crachá de texto (nome / empresa / cargo).
     opts: {widthMm, heightMm, copies, dark, border} */
  function zplForTexto(data, opts){
    opts = opts || {};
    const W = mm2dots(opts.widthMm || 80);
    const H = mm2dots(opts.heightMm || 30);
    const layout = buildLayout('texto', data, W, H, opts);
    return layoutToZPL(layout, W, H, opts.copies || 1);
  }

  /* ============================================================
     PREVIEW (canvas) — desenha o mesmo layout usado no ZPL
     ============================================================ */
  function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
  function nextRand(state){ return (Math.imul(state,1103515245)+12345)>>>0; }

  function drawFakeQR(ctx,x,y,size,data){
    const n=25, cell=size/n;
    ctx.fillStyle='#111';
    let h = hashStr(data||'x');
    for(let r=0;r<n;r++) for(let c=0;c<n;c++){
      h = nextRand(h);
      const inFinder = (r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
      let on;
      if(inFinder){
        const rr = r<7?r:r-(n-7), cc = c<7?c:c-(n-7);
        on = (rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4));
      } else { on = ((h>>>17)&1)===1; }
      if(on) ctx.fillRect(x+c*cell, y+r*cell, Math.ceil(cell), Math.ceil(cell));
    }
    ctx.strokeStyle='#d0d4da'; ctx.strokeRect(x,y,size,size);
  }

  function drawFakeBarcode(ctx,x,y,w,h,data,symbology){
    const textH = Math.max(11, h*0.24), barH = h - textH;
    ctx.fillStyle='#111';
    let s = hashStr((data||'')+'|'+symbology);
    let cx = x;
    while(cx < x+w-2){
      s = nextRand(s); const bw = 1 + (s%4);
      s = nextRand(s); const gap = 1 + (s%3);
      ctx.fillRect(cx, y, bw, barH); cx += bw + gap;
    }
    ctx.font = `${Math.max(9, textH*0.8)}px ui-monospace, monospace`;
    ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillStyle='#111';
    const shown = symbology==='EAN13' ? onlyDigits(data) : String(data||'');
    ctx.fillText(shown, x+w/2, y+barH+2, w);
  }

  /* Desenha a lista de elementos num contexto 2d já dimensionado.
     opts: {symbology} */
  function drawLayout(ctx, layout, scale, opts){
    opts = opts || {};
    for(const e of layout){
      if(e.type === 'bg'){
        ctx.fillStyle='#111'; ctx.fillRect(e.x*scale, e.y*scale, e.w*scale, e.h*scale);
      } else if(e.type === 'box'){
        ctx.strokeStyle='#111'; ctx.lineWidth=Math.max(1, e.thickness*scale);
        ctx.strokeRect(e.x*scale, e.y*scale, e.w*scale, e.h*scale);
      } else if(e.type === 'text'){
        ctx.fillStyle = e.reverse ? '#fff' : '#111';
        ctx.font = `${e.bold?'bold ':''}${Math.max(6, e.font*scale)}px Arial, sans-serif`;
        ctx.textBaseline='top';
        const txt = e.upper ? String(e.text).toUpperCase() : String(e.text);
        const bw = e.blockW*scale;
        ctx.textAlign = e.align==='C'?'center':e.align==='R'?'right':'left';
        const dx = e.align==='C' ? e.x*scale+bw/2 : e.align==='R' ? e.x*scale+bw : e.x*scale;
        ctx.fillText(txt, dx, e.y*scale, bw);
      } else if(e.type === 'qr'){
        drawFakeQR(ctx, e.x*scale, e.y*scale, e.est*scale, e.data);
      } else if(e.type === 'barcode'){
        drawFakeBarcode(ctx, e.x*scale, e.y*scale, e.blockW*scale, e.height*scale, e.data, e.symbology || opts.symbology);
      }
    }
  }

  /* Desenha o crachá inteiro num <canvas>, ajustando o tamanho. Devolve a escala usada. */
  function renderToCanvas(canvas, layout, W, H, maxW, maxH, opts){
    const scale = Math.min((maxW||372)/W, (maxH||300)/H);
    canvas.width  = Math.max(1, Math.round(W*scale));
    canvas.height = Math.max(1, Math.round(H*scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLayout(ctx, layout, scale, opts);
    return scale;
  }

  global.CrachaCore = {
    DPMM, clamp, mm2dots, san,
    nameParts, shortName, shortNameCandidates, resolveDisplayNames,
    fontWidthRatio, fitFontToWidth,
    buildLayout, zplEscape, onlyDigits, layoutToZPL, zplForTexto,
    drawLayout, renderToCanvas
  };
})(window);
