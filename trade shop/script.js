// script.js - logic สำหรับทุกหน้า (Home / Product / Cart / Checkout / Seller)
// ข้อมูลจำลอง (mock data) — ปรับหรือเชื่อม API จริงได้ภายหลัง
const PRODUCTS = [
    {id:1, title:'ผ้าไหมทอมือบ้านหนอง', price:650, category:'ผ้า', district:'เมือง', seller:'กลุ่มผ้าไหมบ้านหนอง', stock:12, img:'', desc:'ผ้าไหมทอมือคุณภาพจากกลุ่มสตรีในชุมชน'},
    {id:2, title:'น้ำพริกปลาร้าสูตรโบราณ', price:120, category:'อาหาร', district:'เมือง', seller:'ร้านแม่สาย', stock:40, img:'', desc:'รสจัดจ้าน ทำจากปลาร้าคัดพิเศษ'},
    {id:3, title:'สบู่สมุนไพรลาเวนเดอร์', price:90, category:'ของใช้', district:'กิ่งอำเภอ', seller:'สวนสมุนไพรบ้านนา', stock:30, img:'', desc:'สบู่ออร์แกนิก ไม่ใส่สารกันเสีย เหมาะผิวแพ้ง่าย'},
    {id:4, title:'ชาเขียวปลอดสาร', price:220, category:'เครื่องดื่ม', district:'อำเภอเหนือ', seller:'ไร่ชาวบ้าน', stock:18, img:'', desc:'ใบชาคัดพิเศษ ปลูกแบบปลอดสาร'},
    {id:5, title:'ขนมไทยโบราณ (กล่อง)', price:180, category:'อาหาร', district:'เมือง', seller:'คุณยายสมใจ', stock:25, img:'', desc:'ขนมไทยทำวันต่อวัน สั่งได้จำนวนมาก'},
    {id:6, title:'เครื่องเงินงานฝีมือ', price:1500, category:'ของใช้', district:'อำเภอใต้', seller:'ช่างท้องถิ่น', stock:6, img:'', desc:'เครื่องเงินดีไซน์พื้นเมือง ทำมือทุกชิ้น'},
    {id:7, title:'ข้าวอินทรีย์ 5 กก.', price:420, category:'อาหาร', district:'อำเภอเหนือ', seller:'กลุ่มชาวนา', stock:80, img:'', desc:'ข้าวหอมมะลิอินทรีย์'},
    {id:8, title:'กระเป๋าผ้าทอมือ', price:350, category:'ผ้า', district:'อำเภอใต้', seller:'กลุ่มแม่บ้าน', stock:22, img:'', desc:'กระเป๋าผ้าทอมือ ดีไซน์ทันสมัย'}
  ];
  
  // ---------- state / storage ----------
  let CART = JSON.parse(localStorage.getItem('pm_cart') || '[]');
  function saveCart(){ localStorage.setItem('pm_cart', JSON.stringify(CART)); updateCartCount(); }
  
  // update cart count at header
  function updateCartCount(){
    const el = document.getElementById('cartCount');
    if(el) el.textContent = CART.reduce((s,i)=>s+i.qty,0);
  }
  
  // helper format price
  function f(v){ return `฿${Number(v).toLocaleString('th-TH')}` }
  
  // ---------- utilities ----------
  function qs(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }
  
  // ---------- Home page rendering ----------
  function renderHome(){
    // category list
    const cats = Array.from(new Set(PRODUCTS.map(p=>p.category)));
    const catContainer = document.getElementById('categoryList');
    if(catContainer){
      catContainer.innerHTML = '<button class="chip active" data-cat="all">ทั้งหมด</button>';
      cats.forEach(c=>{
        const b = document.createElement('button'); b.className='chip'; b.textContent=c; b.dataset.cat=c;
        b.onclick = ()=>{ document.querySelectorAll('#categoryList .chip').forEach(x=>x.classList.remove('active')); b.classList.add('active'); applyFilters(); };
        catContainer.appendChild(b);
      });
    }
  
    // districts
    const dists = Array.from(new Set(PRODUCTS.map(p=>p.district)));
    const distSel = document.getElementById('districtFilter');
    if(distSel){
      dists.forEach(d=>{ const o=document.createElement('option'); o.value=d; o.textContent=d; distSel.appendChild(o); });
    }
  
    // event listeners
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const loadMore = document.getElementById('loadMore');
    const applyFilter = document.getElementById('applyFilter');
    let visibleCount = 6;
  
    if(searchBtn) searchBtn.onclick = ()=>{ applyFilters(); };
    if(searchInput) searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') applyFilters(); });
    if(loadMore) loadMore.onclick = ()=>{ visibleCount += 6; applyFilters(); };
    if(applyFilter) applyFilter.onclick = ()=>{ applyFilters(); };
  
    // initial render
    function applyFilters(){
      const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
      const activeCatBtn = document.querySelector('#categoryList .chip.active');
      const cat = activeCatBtn ? activeCatBtn.dataset.cat : 'all';
      const dist = document.getElementById('districtFilter')?.value || 'all';
      const minP = Number(document.getElementById('minPrice')?.value || 0);
      const maxP = Number(document.getElementById('maxPrice')?.value || Infinity);
  
      let list = PRODUCTS.filter(p=>{
        if(cat !== 'all' && p.category !== cat) return false;
        if(dist !== 'all' && p.district !== dist) return false;
        if(p.price < minP) return false;
        if(maxP !== Infinity && p.price > maxP) return false;
        if(query && ![p.title,p.seller,p.category].join(' ').toLowerCase().includes(query)) return false;
        return true;
      });
  
      const grid = document.getElementById('productGrid');
      if(!grid) return;
      grid.innerHTML = '';
      const visible = list.slice(0, visibleCount);
      visible.forEach(p=>{
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = `
          <div class="img">${p.img? `<img src="${p.img}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">` : 'รูปสินค้า'}</div>
          <div class="title">${p.title}</div>
          <div class="seller">${p.seller} • ${p.district}</div>
          <div class="price">${f(p.price)}</div>
          <div class="actions">
            <div><button class="btn view" data-id="${p.id}">ดูรายละเอียด</button></div>
            <div><button class="btn add add-inline" data-id="${p.id}">เพิ่มลงตะกร้า</button></div>
          </div>`;
        grid.appendChild(card);
      });
  
      // attach listeners
      document.querySelectorAll('.view').forEach(b=>b.onclick = e=>{ const id = e.currentTarget.dataset.id; window.location.href = `product.html?id=${id}`; });
      document.querySelectorAll('.add-inline').forEach(b=>b.onclick = e=>{ const id = +e.currentTarget.dataset.id; addToCart(id,1); });
    }
  
    applyFilters();
  }
  
  // ---------- Product page ----------
  function renderProductPage(){
    const id = Number(qs('id'));
    const target = document.getElementById('productDetail');
    if(!id || !target) return;
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p){ target.innerHTML = '<div>ไม่พบสินค้า</div>'; return; }
  
    target.innerHTML = `
      <div class="img-large">${p.img? `<img src="${p.img}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">` : 'รูปสินค้า'}</div>
      <div class="meta">
        <h2>${p.title}</h2>
        <div class="seller">${p.seller} • ${p.district}</div>
        <div class="price" style="font-size:20px;margin-top:6px">${f(p.price)}</div>
        <p style="margin-top:8px;color:var(--muted)">${p.desc}</p>
  
        <div class="qty">
          <label>จำนวน:</label>
          <input id="qty" type="number" value="1" min="1" max="${p.stock}" style="width:80px;margin-left:8px" />
        </div>
  
        <div style="margin-top:12px;display:flex;gap:8px">
          <button id="buyNow" class="btn add">ซื้อทันที</button>
          <button id="addCart" class="btn">เพิ่มลงตะกร้า</button>
        </div>
  
        <div style="margin-top:12px;color:var(--muted)">คงเหลือ: ${p.stock} ชิ้น</div>
      </div>
    `;
  
    document.getElementById('addCart').onclick = ()=>{
      const q = Number(document.getElementById('qty').value || 1);
      addToCart(p.id, q);
    };
    document.getElementById('buyNow').onclick = ()=>{
      const q = Number(document.getElementById('qty').value || 1);
      addToCart(p.id, q);
      window.location.href = 'cart.html';
    };
  }
  
  // ---------- Cart functions (used by many pages) ----------
  function addToCart(id, qty=1){
    const prod = PRODUCTS.find(p=>p.id===id);
    if(!prod) return alert('ไม่พบสินค้า');
    const idx = CART.findIndex(i=>i.id===id);
    if(idx > -1){
      CART[idx].qty += qty;
    } else {
      CART.push({id:prod.id, title:prod.title, price:prod.price, qty:qty});
    }
    saveCart();
    alert('เพิ่มลงตะกร้า: ' + prod.title);
  }
  
  function removeFromCart(id){
    CART = CART.filter(i=>i.id !== id);
    saveCart();
    renderCartPage(); // if on cart page
  }
  
  function changeQty(id, newQty){
    const it = CART.find(i=>i.id===id);
    if(!it) return;
    it.qty = newQty;
    if(it.qty <= 0) removeFromCart(id);
    saveCart();
    renderCartPage();
  }
  
  // ---------- Cart page rendering ----------
  function renderCartPage(){
    const el = document.getElementById('cartItems');
    if(!el) return;
    el.innerHTML = '';
    if(CART.length === 0){
      el.innerHTML = '<div style="padding:12px;background:#fff;border-radius:8px">ตะกร้าว่าง</div>';
      document.getElementById('cartTotal').textContent = f(0);
      return;
    }
  
    let total = 0;
    CART.forEach(item=>{
      const row = document.createElement('div'); row.className = 'cart-item';
      const subtotal = item.price * item.qty; total += subtotal;
      row.innerHTML = `
        <div style="flex:1">
          <div style="font-weight:700">${item.title}</div>
          <div style="color:var(--muted);font-size:13px">${f(item.price)} x ${item.qty} = ${f(subtotal)}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn" data-op="dec" data-id="${item.id}">-</button>
          <div>${item.qty}</div>
          <button class="btn" data-op="inc" data-id="${item.id}">+</button>
          <button class="btn" data-op="rm" data-id="${item.id}">ลบ</button>
        </div>
      `;
      el.appendChild(row);
    });
  
    document.getElementById('cartTotal').textContent = f(total);
  
    el.querySelectorAll('button').forEach(b=>{
      b.onclick = (e)=>{
        const op = b.dataset.op; const id = +b.dataset.id;
        const it = CART.find(x=>x.id===id);
        if(!it) return;
        if(op === 'inc') changeQty(id, it.qty + 1);
        if(op === 'dec') changeQty(id, it.qty - 1);
        if(op === 'rm') removeFromCart(id);
      };
    });
  
    const checkoutNow = document.getElementById('checkoutNow');
    if(checkoutNow) checkoutNow.onclick = ()=>{ window.location.href = 'checkout.html'; };
  }
  
  // ---------- Checkout page ----------
  function renderCheckout(){
    const summaryEl = document.getElementById('orderSummary');
    if(!summaryEl) return;
    if(CART.length === 0){ summaryEl.innerHTML = '<div>ตะกร้าว่าง — กรุณาเพิ่มสินค้า</div>'; return; }
    let total = 0;
    const list = CART.map(i=>{
      const p = PRODUCTS.find(x=>x.id===i.id);
      const subtotal = i.qty * i.price; total += subtotal;
      return `<div>${i.title} x ${i.qty} = ${f(subtotal)}</div>`;
    }).join('');
    summaryEl.innerHTML = `<div style="padding:8px;background:#fff;border-radius:8px">${list}<div style="margin-top:8px;font-weight:800">รวม ${f(total)}</div></div>`;
  
    document.getElementById('placeOrder').onclick = ()=>{
      const name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const addr = document.getElementById('custAddr').value.trim();
      const pay = document.getElementById('payMethod').value;
  
      if(!name || !phone || !addr) return alert('กรุณากรอกข้อมูลผู้สั่งให้ครบ');
      // สร้างคำสั่งซื้อจำลอง
      const order = {
        id: 'ORD' + Date.now(),
        items: CART,
        name, phone, addr, pay,
        total: CART.reduce((s,i)=>s+i.price*i.qty,0),
        created: new Date().toISOString()
      };
      // เก็บคำสั่งซื้อใน localStorage (ตัวอย่าง)
      const orders = JSON.parse(localStorage.getItem('pm_orders') || '[]');
      orders.push(order);
      localStorage.setItem('pm_orders', JSON.stringify(orders));
  
      // ล้างตะกร้า
      CART = [];
      saveCart();
  
      document.getElementById('orderResult').innerHTML = `<div style="padding:12px;background:#ecfffa;border-radius:8px">สั่งซื้อเรียบร้อย หมายเลขคำสั่งซื้อ: <strong>${order.id}</strong><br>ยอดชำระ ${f(order.total)}</div>`;
    };
  }
  
  // ---------- Seller page ----------
  function renderSellerPage(){
    const profileEl = document.getElementById('sellerProfile');
    const prodEl = document.getElementById('sellerProducts');
    if(!profileEl || !prodEl) return;
  
    // ตัวอย่างโปรไฟล์ผู้ขาย
    const profile = {
      name: 'กลุ่มผลิตภัณฑ์ชุมชนตัวอย่าง',
      contact: '08x-xxx-xxxx',
      desc: 'กลุ่มผลิตภัณฑ์ชุมชนภายในจังหวัด ผลิตภัณฑ์คุณภาพ สั่งซื้อได้ภายในจังหวัด'
    };
    profileEl.innerHTML = `
      <div style="padding:12px;background:#fff;border-radius:8px">
        <div style="font-weight:800">${profile.name}</div>
        <div style="color:var(--muted);margin-top:6px">${profile.desc}</div>
        <div style="margin-top:8px;color:var(--muted)">ติดต่อ: ${profile.contact}</div>
      </div>
    `;
  
    // แสดงสินค้าที่ seller นี้มี (ตัวอย่าง: filter by same seller name)
    const sellerProducts = PRODUCTS.filter(p=>p.seller === PRODUCTS[0].seller);
    prodEl.innerHTML = '';
    sellerProducts.forEach(p=>{
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `
        <div class="img">รูปสินค้า</div>
        <div class="title">${p.title}</div>
        <div class="price">${f(p.price)}</div>
        <div style="margin-top:8px"><button class="btn view" data-id="${p.id}">ดู</button> <button class="btn add-inline" data-id="${p.id}">เพิ่มลงตะกร้า</button></div>
      `;
      prodEl.appendChild(card);
    });
  
    document.querySelectorAll('.view').forEach(b=>b.onclick = e=>{ const id = e.currentTarget.dataset.id; window.location.href = `product.html?id=${id}`; });
    document.querySelectorAll('.add-inline').forEach(b=>b.onclick = e=>{ addToCart(+e.currentTarget.dataset.id,1); });
  }
  
  // ---------- Global init: detect page and render ----------
  function init(){
    updateCartCount();
  
    // common header search
    const sInput = document.getElementById('searchInput');
    const sBtn = document.getElementById('searchBtn');
    if(sBtn && sInput){
      sBtn.onclick = ()=>{ const q = sInput.value.trim(); if(q){ localStorage.setItem('pm_search', q); window.location.href = 'index.html'; } };
      sInput.addEventListener('keydown', e=>{ if(e.key==='Enter'){ sBtn.click(); }});
      // if there was a search query triggered from other pages, fill input
      const q0 = localStorage.getItem('pm_search');
      if(q0){ sInput.value = q0; localStorage.removeItem('pm_search'); }
    }
  
    // route by presence of element IDs (simple)
    if(document.getElementById('productGrid')) renderHome();
    if(document.getElementById('productDetail')) renderProductPage();
    if(document.getElementById('cartItems')) renderCartPage();
    if(document.getElementById('orderSummary')) renderCheckout();
    if(document.getElementById('sellerProfile')) renderSellerPage();
  }
  
  // run on load
  window.addEventListener('DOMContentLoaded', init);
  