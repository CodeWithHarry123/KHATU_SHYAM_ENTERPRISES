import{o as M,d as H,b as x,g as U,a as b,s as F,e as k,w as l,q as w,c as D,f as v}from"./firebase-init-CdBNjGdT.js";/* empty css                   */import{s as A,h as N}from"./loader-NzwXbrqv.js";import{u as h,w as q}from"./xlsx-3SA47z_C.js";import"./lazy-loader-CPsUXe95.js";document.addEventListener("DOMContentLoaded",()=>{M(b,a=>{if(a){const r=H(x,"users",a.uid);U(r).then(e=>{e.exists()&&e.data().khatu_website_admin?(console.log("Admin user authenticated successfully."),S()):(console.log("Access Denied: User is not an admin."),alert("Access Denied. You do not have permission to view this page."),window.location.href="dashboard.html")}).catch(e=>{console.error("Error getting user document:",e),window.location.href="login.html"})}else console.log("No user logged in. Redirecting to login."),window.location.href="login.html"});const E=document.getElementById("logout-button"),L=document.getElementById("sidebar"),I=document.getElementById("sidebar-toggle"),R=document.getElementById("generate-report-button"),B=document.getElementById("export-excel-button"),y=document.getElementById("report-type"),p=document.getElementById("date-from"),g=document.getElementById("date-to"),m=document.getElementById("report-title"),d=document.getElementById("report-table-container");let n=[];I.addEventListener("click",()=>{L.classList.toggle("-translate-x-full")}),E.addEventListener("click",a=>{a.preventDefault(),F(b).then(()=>{window.location.href="index.html"})}),R.addEventListener("click",f),B.addEventListener("click",_),localStorage.getItem("color-theme")==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");function S(){const a=new Date,r=new Date(a.getFullYear(),a.getMonth(),1);g.valueAsDate=a,p.valueAsDate=r,f()}function f(){const a=y.value,r=p.value?new Date(p.value):null,e=g.value?new Date(g.value):null;e&&e.setHours(23,59,59,999),m.textContent=`${a.charAt(0).toUpperCase()+a.slice(1)} Report`,a==="bookings"?T(r,e):a==="users"&&$(r,e)}async function T(a,r){A();try{const e=[k("bookingDate","desc")];a&&e.push(l("bookingDate",">=",a)),r&&e.push(l("bookingDate","<=",r));const i=w(D(x,"bookings"),...e),t=await v(i);n=[];let o=`
                <table class="w-full text-left responsive-table">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            `;t.empty?o+='<tr><td colspan="6" class="text-center py-10">No bookings found for the selected period.</td></tr>':t.forEach(c=>{const s={id:c.id,...c.data()};n.push(s);const u=s.bookingDate?s.bookingDate.toDate().toLocaleDateString():"N/A";o+=`
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td data-label="Booking ID" class="px-6 py-4 whitespace-nowrap text-sm">${s.bookingId??"N/A"}</td>
                            <td data-label="Date" class="px-6 py-4 whitespace-nowrap text-sm">${u}</td>
                            <td data-label="Customer" class="px-6 py-4 whitespace-nowrap text-sm">${s.senderDetails?.name??"N/A"}</td>
                            <td data-label="From" class="px-6 py-4 whitespace-nowrap text-sm">${s.senderDetails?.pincode??"N/A"}</td>
                            <td data-label="To" class="px-6 py-4 whitespace-nowrap text-sm">${s.receiverDetails?.pincode??"N/A"}</td>
                            <td data-label="Status" class="px-6 py-4 whitespace-nowrap text-sm">${s.status??"N/A"}</td>
                        </tr>
                    `}),o+="</tbody></table>",d.innerHTML=o}catch(e){console.error("Error fetching bookings report: ",e),d.innerHTML=`<tr class="text-center"><td colspan="6" class="py-10 text-red-500">Error: ${e.message}</td></tr>`}finally{N()}}async function $(a,r){A();try{const e=[k("createdAt","desc")];a&&e.push(l("createdAt",">=",a)),r&&e.push(l("createdAt","<=",r));const i=w(D(x,"users"),...e),t=await v(i);n=[];let o=`
                <table class="w-full text-left responsive-table">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Info</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registration Date</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            `;t.empty?o+='<tr><td colspan="3" class="text-center py-10">No users found for the selected period.</td></tr>':t.forEach(c=>{const s=c.data();n.push(s);const u=s.createdAt?s.createdAt.toDate().toLocaleDateString():"N/A",C=s.khatu_website_admin===!0;o+=`
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td data-label="User Info" class="px-6 py-4 whitespace-nowrap">
                                <div class="text-base font-medium">${s.name??"N/A"}</div>
                                <div class="text-sm text-gray-500">${s.phoneNumber??"N/A"}</div>
                            </td>
                            <td data-label="Registration Date" class="px-6 py-4 whitespace-nowrap text-sm">${u}</td>
                            <td data-label="Role" class="px-6 py-4 whitespace-nowrap text-sm">${C?"Admin":"User"}</td>
                        </tr>
                    `}),o+="</tbody></table>",d.innerHTML=o}catch(e){console.error("Error fetching users report: ",e),d.innerHTML=`<tr class="text-center"><td colspan="3" class="py-10 text-red-500">Error: ${e.message}</td></tr>`}finally{N()}}function _(){if(n.length===0){alert("No data to export.");return}const a=y.value;let r;a==="bookings"?r=n.map(t=>({"Booking ID":t.bookingId??"N/A",Date:t.bookingDate?.toDate().toLocaleString()??"N/A",Status:t.status??"N/A","Sender Name":t.senderDetails?.name??"N/A","Sender Mobile":t.senderDetails?.mobile??"N/A","Sender Address":t.senderDetails?.address??"N/A","Sender Pincode":t.senderDetails?.pincode??"N/A","Receiver Name":t.receiverDetails?.name??"N/A","Receiver Mobile":t.receiverDetails?.mobile??"N/A","Receiver Address":t.receiverDetails?.address??"N/A","Receiver Pincode":t.receiverDetails?.pincode??"N/A"})):r=n.map(t=>({Name:t.name??"N/A","Phone Number":t.phoneNumber??"N/A","Registration Date":t.createdAt?.toDate().toLocaleString()??"N/A",Role:t.khatu_website_admin?"Admin":"User"}));const e=h.json_to_sheet(r),i=h.book_new();h.book_append_sheet(i,e,`${m.textContent}`),q(i,`KhatuShyam_${m.textContent.replace(/ /g,"_")}.xlsx`)}LazyLoader.init()});
