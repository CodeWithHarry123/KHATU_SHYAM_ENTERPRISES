import{o as N,d as h,b as m,g as A,a as D,s as L,u as B,c as I,q as $,e as E,f as S}from"./firebase-init-CdBNjGdT.js";/* empty css                   */import{s as T,h as C}from"./loader-NzwXbrqv.js";import{u as p,w as M}from"./xlsx-3SA47z_C.js";N(D,o=>{if(o){const e=h(m,"users",o.uid);A(e).then(t=>{t.exists()&&t.data().khatu_website_admin?(console.log("Admin user authenticated successfully."),document.getElementById("admin-content-wrapper").style.display="flex",w()):(console.log("Access Denied: User is not an admin."),alert("Access Denied. You do not have permission to view this page."),window.location.href="dashboard.html")}).catch(t=>{console.error("Error getting user document:",t),window.location.href="login.html"})}else console.log("No user logged in. Redirecting to login."),window.location.href="login.html"});const g=document.getElementById("admin-bookings-table-body"),u=document.getElementById("admin-bookings-card-view"),P=document.getElementById("download-excel-button"),H=document.getElementById("print-button"),R=document.getElementById("logout-button"),_=document.getElementById("sidebar"),U=document.getElementById("sidebar-toggle"),l=document.getElementById("booking-modal"),v=document.getElementById("modal-content"),q=document.getElementById("modal-body"),z=document.getElementById("modal-close-button"),f=document.getElementById("search-input");let a=[];function j(o){const e=a.find(s=>s.id===o);if(!e)return;let t="N/A";if(e.bookingDate)if(typeof e.bookingDate.toDate=="function")t=e.bookingDate.toDate().toLocaleString();else try{t=new Date(e.bookingDate).toLocaleString()}catch{console.error("Could not parse bookingDate in modal:",e.bookingDate),t="Invalid Date"}q.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sender Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Sender Details</h3>
                <p><strong>Name:</strong> ${e.senderDetails?.name??"N/A"}</p>
                <p><strong>Mobile:</strong> ${e.senderDetails?.mobile??"N/A"}</p>
                <p><strong>Pincode:</strong> ${e.senderDetails?.pincode??"N/A"}</p>
                <p><strong>Address:</strong> ${e.senderDetails?.address??"N/A"}</p>
            </div>
            <!-- Receiver Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Receiver Details</h3>
                <p><strong>Name:</strong> ${e.receiverDetails?.name??"N/A"}</p>
                <p><strong>Mobile:</strong> ${e.receiverDetails?.mobile??"N/A"}</p>
                <p><strong>Pincode:</strong> ${e.receiverDetails?.pincode??"N/A"}</p>
                <p><strong>Address:</strong> ${e.receiverDetails?.address??"N/A"}</p>
            </div>
        </div>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <!-- Parcel Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Parcel Details</h3>
                <p><strong>Weight:</strong> ${e.parcelDetails?.weight??"N/A"} kg</p>
                <p><strong>Size:</strong> ${e.parcelDetails?.size??"N/A"}</p>
                <p><strong>Type:</strong> ${e.parcelDetails?.type??"N/A"}</p>
            </div>
            <!-- Booking Info -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Booking Info</h3>
                <p><strong>Booking ID:</strong> ${e.bookingId??"N/A"}</p>
                <p><strong>Price (incl. GST):</strong> ₹${e.amount??"N/A"}</p>
                <p><strong>Status:</strong> ${e.status??"N/A"}</p>
                <p><strong>Date:</strong> ${t}</p>
                <p><strong>User ID:</strong> ${e.userId??"N/A"}</p>
            </div>
        </div>
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Update Status</h3>
            <div class="mt-4 flex items-center gap-4">
                <select id="status-select" class="form-select w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary focus:ring-primary">
                    <option value="Booked" ${e.status==="Booked"?"selected":""}>Booked</option>
                    <option value="In Transit" ${e.status==="In Transit"?"selected":""}>In Transit</option>
                    <option value="Delivered" ${e.status==="Delivered"?"selected":""}>Delivered</option>
                </select>
                <button id="update-status-button" data-booking-id="${e.id}" class="flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-bold">Update</button>
            </div>
        </div>
    `,l.classList.remove("hidden"),l.classList.add("flex"),setTimeout(()=>v.classList.remove("scale-95"),50)}function y(){v.classList.add("scale-95"),setTimeout(()=>{l.classList.add("hidden"),l.classList.remove("flex")},300)}function F(o,e){let t;return function(...s){const r=this;clearTimeout(t),t=setTimeout(()=>o.apply(r,s),e)}}U.addEventListener("click",()=>{_.classList.toggle("-translate-x-full")});R.addEventListener("click",o=>{o.preventDefault(),L(D).then(()=>{window.location.href="index.html"})});H.addEventListener("click",()=>window.print());z.addEventListener("click",y);l.addEventListener("click",o=>{o.target===l&&y()});const V=F(()=>{const o=f.value.toLowerCase().trim(),e=a.filter(t=>{const s=(t.senderDetails?.name||"").toLowerCase(),r=(t.receiverDetails?.name||"").toLowerCase(),n=(t.bookingId||"").toLowerCase(),d=(t.senderDetails?.pincode||"").toLowerCase(),c=(t.receiverDetails?.pincode||"").toLowerCase(),i=(t.senderDetails?.mobile||"").toLowerCase(),b=(t.receiverDetails?.mobile||"").toLowerCase(),k=(t.status||"").toLowerCase();return s.includes(o)||r.includes(o)||n.includes(o)||d.includes(o)||c.includes(o)||i.includes(o)||b.includes(o)||k.includes(o)});x(e)},300);f.addEventListener("input",V);localStorage.getItem("color-theme")==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");document.body.addEventListener("click",function(o){const e=o.target.closest(".view-booking-button");if(e){const s=e.dataset.bookingId;j(s);return}const t=o.target.closest("#update-status-button");if(t){const s=t.dataset.bookingId,r=document.getElementById("status-select").value,n=h(m,"bookings",s);B(n,{status:r}).then(()=>{alert("Status updated successfully!"),y(),w()}).catch(d=>{console.error("Error updating status: ",d),alert("Error updating status.")})}});P.addEventListener("click",()=>{if(a.length===0){alert("No data to export.");return}const o=a.map(s=>({"Booking ID":s.bookingId??"N/A","Booking Date":s.bookingDate?.toDate().toLocaleString()??"N/A",Status:s.status??"N/A","Sender Name":s.senderDetails?.name??"N/A","Sender Mobile":s.senderDetails?.mobile??"N/A","Sender Address":s.senderDetails?.address??"N/A","Sender Pincode":s.senderDetails?.pincode??"N/A","Receiver Name":s.receiverDetails?.name??"N/A","Receiver Mobile":s.receiverDetails?.mobile??"N/A","Receiver Address":s.receiverDetails?.address??"N/A","Receiver Pincode":s.receiverDetails?.pincode??"N/A","Parcel Weight (kg)":s.parcelDetails?.weight??"N/A","Parcel Size (cm)":s.parcelDetails?.size??"N/A","Parcel Type":s.parcelDetails?.type??"N/A","User ID":s.userId??"N/A"})),e=p.json_to_sheet(o),t=p.book_new();p.book_append_sheet(t,e,"Bookings"),M(t,"KhatuShyam_Bookings.xlsx")});function W(o){switch(o){case"Delivered":return"bg-green-100 text-green-800";case"In Transit":return"bg-yellow-100 text-yellow-800";case"Booked":default:return"bg-blue-100 text-blue-800"}}function x(o){if(g.innerHTML="",u.innerHTML="",o.length===0){const e='<p class="text-center py-10 col-span-full">No bookings match your criteria.</p>';g.innerHTML=`<tr><td colspan="7">${e}</td></tr>`,u.innerHTML=e;return}o.forEach(e=>{let t="N/A";if(e.bookingDate)if(typeof e.bookingDate.toDate=="function")t=e.bookingDate.toDate().toLocaleDateString();else try{t=new Date(e.bookingDate).toLocaleDateString()}catch{console.error("Could not parse bookingDate in render:",e.bookingDate),t="Invalid Date"}const s=W(e.status),r=e.senderDetails&&e.senderDetails.name||"N/A",n=e.senderDetails&&e.senderDetails.pincode||"N/A",d=e.receiverDetails&&e.receiverDetails.pincode||"N/A",c=document.createElement("tr");c.className="hover:bg-gray-50 dark:hover:bg-gray-800",c.innerHTML=`
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${e.bookingId||"N/A"}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-text-dark">${r}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${n}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${d}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${t}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${s}">${e.status||"N/A"}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="view-booking-button font-medium text-primary dark:text-secondary hover:underline" data-booking-id="${e.id}">View</button>
            </td>`;const i=document.createElement("div");i.className="view-booking-button bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow",i.dataset.bookingId=e.id,i.innerHTML=`
            <div class="flex justify-between items-start">
                <div class="font-bold text-primary dark:text-secondary">${e.bookingId||"N/A"}</div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${s}">${e.status||"N/A"}</span>
            </div>
            <div class="text-sm">
                <p class="font-medium text-gray-800 dark:text-gray-200">${r}</p>
                <p class="text-gray-500 dark:text-gray-400">From: ${n} ⟶ To: ${d}</p>
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                Booked on: ${t}
            </div>`,g.appendChild(c),u.appendChild(i)})}async function w(){T();const o=I(m,"bookings"),e=$(o,E("bookingDate","desc"));try{const t=await S(e);a=[],t.forEach(s=>{a.push({id:s.id,...s.data()})}),x(a)}catch(t){console.error("Error getting documents: ",t);const s='<p class="text-center py-10 text-red-500 col-span-full">Error loading bookings. Check console and Firestore rules.</p>';g.innerHTML=`<tr><td colspan="7">${s}</td></tr>`,u.innerHTML=s}finally{C()}}
