import{o as B,d as m,b as p,g as L,a as y,s as I,u as $,c as E,q as N,e as A,f as S}from"./firebase-init-C-AE0vWN.js";/* empty css                   */import{s as T,h as C}from"./loader-NzwXbrqv.js";import{u as g,w as M}from"./xlsx-3SA47z_C.js";B(y,o=>{if(o){const e=m(p,"users",o.uid);L(e).then(s=>{s.exists()&&s.data().khatu_website_admin?(console.log("Admin user authenticated successfully."),document.getElementById("admin-content-wrapper").style.display="flex",x()):(console.log("Access Denied: User is not an admin."),alert("Access Denied. You do not have permission to view this page."),window.location.href="dashboard.html")}).catch(s=>{console.error("Error getting user document:",s),window.location.href="login.html"})}else console.log("No user logged in. Redirecting to login."),window.location.href="login.html"});const i=document.getElementById("admin-bookings-table-body"),l=document.getElementById("admin-bookings-card-view"),H=document.getElementById("download-excel-button"),P=document.getElementById("print-button"),R=document.getElementById("logout-button"),_=document.getElementById("sidebar"),U=document.getElementById("sidebar-toggle"),d=document.getElementById("booking-modal"),b=document.getElementById("modal-content"),q=document.getElementById("modal-body"),z=document.getElementById("modal-close-button"),h=document.getElementById("search-input");let n=[];function j(o){const e=n.find(t=>t.id===o);if(!e)return;const s=e.bookingDate?e.bookingDate.toDate().toLocaleString():"N/A";q.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sender Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Sender Details</h3>
                <p><strong>Name:</strong> ${e.senderDetails.name}</p>
                <p><strong>Mobile:</strong> ${e.senderDetails.mobile}</p>
                <p><strong>Pincode:</strong> ${e.senderDetails.pincode}</p>
                <p><strong>Address:</strong> ${e.senderDetails.address}</p>
            </div>
            <!-- Receiver Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Receiver Details</h3>
                <p><strong>Name:</strong> ${e.receiverDetails.name}</p>
                <p><strong>Mobile:</strong> ${e.receiverDetails.mobile}</p>
                <p><strong>Pincode:</strong> ${e.receiverDetails.pincode}</p>
                <p><strong>Address:</strong> ${e.receiverDetails.address}</p>
            </div>
        </div>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <!-- Parcel Details -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Parcel Details</h3>
                <p><strong>Weight:</strong> ${e.parcelDetails.weight} kg</p>
                <p><strong>Size:</strong> ${e.parcelDetails.size||"N/A"}</p>
                <p><strong>Type:</strong> ${e.parcelDetails.type}</p>
            </div>
            <!-- Booking Info -->
            <div class="space-y-2">
                <h3 class="font-bold text-lg border-b border-gray-200 dark:border-gray-700 pb-1">Booking Info</h3>
                <p><strong>Booking ID:</strong> ${e.bookingId}</p>
                <p><strong>Status:</strong> ${e.status}</p>
                <p><strong>Date:</strong> ${s}</p>
                <p><strong>User ID:</strong> ${e.userId}</p>
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
    `,d.classList.remove("hidden"),d.classList.add("flex"),setTimeout(()=>b.classList.remove("scale-95"),50)}function u(){b.classList.add("scale-95"),setTimeout(()=>{d.classList.add("hidden"),d.classList.remove("flex")},300)}function F(o,e){let s;return function(...t){const r=this;clearTimeout(s),s=setTimeout(()=>o.apply(r,t),e)}}U.addEventListener("click",()=>{_.classList.toggle("-translate-x-full")});R.addEventListener("click",o=>{o.preventDefault(),I(y).then(()=>{window.location.href="index.html"})});P.addEventListener("click",()=>window.print());z.addEventListener("click",u);d.addEventListener("click",o=>{o.target===d&&u()});const V=F(()=>{const o=h.value.toLowerCase().trim(),e=n.filter(s=>{const t=(s.senderDetails?.name||"").toLowerCase(),r=(s.receiverDetails?.name||"").toLowerCase(),a=(s.bookingId||"").toLowerCase(),c=(s.senderDetails?.pincode||"").toLowerCase(),D=(s.receiverDetails?.pincode||"").toLowerCase(),f=(s.senderDetails?.mobile||"").toLowerCase(),w=(s.receiverDetails?.mobile||"").toLowerCase(),k=(s.status||"").toLowerCase();return t.includes(o)||r.includes(o)||a.includes(o)||c.includes(o)||D.includes(o)||f.includes(o)||w.includes(o)||k.includes(o)});v(e)},300);h.addEventListener("input",V);localStorage.getItem("color-theme")==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");document.body.addEventListener("click",function(o){const e=o.target.closest(".view-booking-button");if(e){const t=e.dataset.bookingId;j(t);return}const s=o.target.closest("#update-status-button");if(s){const t=s.dataset.bookingId,r=document.getElementById("status-select").value,a=m(p,"bookings",t);$(a,{status:r}).then(()=>{alert("Status updated successfully!"),u(),x()}).catch(c=>{console.error("Error updating status: ",c),alert("Error updating status.")})}});H.addEventListener("click",()=>{if(n.length===0){alert("No data to export.");return}const o=n.map(t=>({"Booking ID":t.bookingId??"N/A","Booking Date":t.bookingDate?.toDate().toLocaleString()??"N/A",Status:t.status??"N/A","Sender Name":t.senderDetails?.name??"N/A","Sender Mobile":t.senderDetails?.mobile??"N/A","Sender Address":t.senderDetails?.address??"N/A","Sender Pincode":t.senderDetails?.pincode??"N/A","Receiver Name":t.receiverDetails?.name??"N/A","Receiver Mobile":t.receiverDetails?.mobile??"N/A","Receiver Address":t.receiverDetails?.address??"N/A","Receiver Pincode":t.receiverDetails?.pincode??"N/A","Parcel Weight (kg)":t.parcelDetails?.weight??"N/A","Parcel Size (cm)":t.parcelDetails?.size??"N/A","Parcel Type":t.parcelDetails?.type??"N/A","User ID":t.userId??"N/A"})),e=g.json_to_sheet(o),s=g.book_new();g.book_append_sheet(s,e,"Bookings"),M(s,"KhatuShyam_Bookings.xlsx")});function W(o){switch(o){case"Delivered":return"bg-green-100 text-green-800";case"In Transit":return"bg-yellow-100 text-yellow-800";case"Booked":default:return"bg-blue-100 text-blue-800"}}function v(o){if(i.innerHTML="",l.innerHTML="",o.length===0){const e='<p class="text-center py-10 col-span-full">No bookings match your criteria.</p>';i.innerHTML=`<tr><td colspan="7">${e}</td></tr>`,l.innerHTML=e;return}o.forEach(e=>{if(!e.senderDetails||!e.receiverDetails){console.warn("Skipping booking with missing sender/receiver details:",e.id);return}const s=e.bookingDate?e.bookingDate.toDate().toLocaleDateString():"N/A",t=W(e.status),r=document.createElement("tr");r.className="hover:bg-gray-50 dark:hover:bg-gray-800",r.innerHTML=`
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${e.bookingId||"N/A"}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-text-dark">${e.senderDetails.name||"N/A"}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${e.senderDetails.pincode}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${e.receiverDetails.pincode}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${s}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${t}">${e.status||"N/A"}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="view-booking-button font-medium text-primary dark:text-secondary hover:underline" data-booking-id="${e.id}">View</button>
            </td>`;const a=document.createElement("div");a.className="view-booking-button bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow",a.dataset.bookingId=e.id,a.innerHTML=`
            <div class="flex justify-between items-start">
                <div class="font-bold text-primary dark:text-secondary">${e.bookingId||"N/A"}</div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${t}">${e.status||"N/A"}</span>
            </div>
            <div class="text-sm">
                <p class="font-medium text-gray-800 dark:text-gray-200">${e.senderDetails.name}</p>
                <p class="text-gray-500 dark:text-gray-400">From: ${e.senderDetails.pincode} ⟶ To: ${e.receiverDetails.pincode}</p>
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                Booked on: ${s}
            </div>`,i.appendChild(r),l.appendChild(a)})}async function x(){T();const o=E(p,"bookings"),e=N(o,A("bookingDate","desc"));try{const s=await S(e);n=[],s.forEach(t=>{n.push({id:t.id,...t.data()})}),v(n)}catch(s){console.error("Error getting documents: ",s);const t='<p class="text-center py-10 text-red-500 col-span-full">Error loading bookings. Check console and Firestore rules.</p>';i.innerHTML=`<tr><td colspan="7">${t}</td></tr>`,l.innerHTML=t,console.error("Error loading bookings: ",s)}finally{C()}}
