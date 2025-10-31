import{o as _,d as L,b as m,g as R,a as I,s as j,h as O,u as S,i as z,c as k,f as F}from"./firebase-init-C-AE0vWN.js";/* empty css                   */import{s as P,h as V}from"./loader-NzwXbrqv.js";import"./lazy-loader-CPsUXe95.js";document.addEventListener("DOMContentLoaded",()=>{_(I,e=>{if(e){const s=L(m,"users",e.uid);R(s).then(n=>{n.exists()&&n.data().khatu_website_admin?(console.log("Admin user authenticated successfully."),E()):(console.log("Access Denied: User is not an admin."),alert("Access Denied. You do not have permission to view this page."),window.location.href="dashboard.html")}).catch(n=>{console.error("Error getting user document:",n),window.location.href="login.html"})}else console.log("No user logged in. Redirecting to login."),window.location.href="login.html"});const d=document.getElementById("users-table-body"),r=document.getElementById("users-card-view"),B=document.getElementById("logout-button"),A=document.getElementById("sidebar"),D=document.getElementById("sidebar-toggle"),T=document.getElementById("search-input"),U=document.getElementById("add-user-button"),o=document.getElementById("user-modal"),g=document.getElementById("modal-content"),x=document.getElementById("modal-title"),$=document.getElementById("modal-close-button"),C=document.getElementById("modal-cancel-button"),f=document.getElementById("user-form"),p=document.getElementById("user-id"),y=document.getElementById("user-name"),h=document.getElementById("user-phone"),v=document.getElementById("user-role");let i=[];D.addEventListener("click",()=>A.classList.toggle("-translate-x-full")),B.addEventListener("click",e=>{e.preventDefault(),j(I).then(()=>window.location.href="index.html")}),T.addEventListener("input",e=>w(i,e.target.value)),U.addEventListener("click",()=>b()),$.addEventListener("click",l),C.addEventListener("click",l),o.addEventListener("click",e=>{e.target===o&&l()}),f.addEventListener("submit",M),document.body.addEventListener("click",function(e){const s=e.target.closest(".edit-user-button");if(s){const n=s.dataset.userId;b(n)}}),localStorage.getItem("color-theme")==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");function b(e=null){if(f.reset(),e){const s=i.find(n=>n.id===e);s&&(x.textContent="Edit User",p.value=s.id,y.value=s.name||"",h.value=s.phoneNumber||"",v.value=s.khatu_website_admin?"admin":"user")}else x.textContent="Add User",p.value="";o.classList.remove("hidden"),o.classList.add("flex"),setTimeout(()=>g.classList.remove("scale-95"),50)}function l(){g.classList.add("scale-95"),setTimeout(()=>{o.classList.add("hidden"),o.classList.remove("flex")},300)}function M(e){e.preventDefault();const s=p.value,n={name:y.value,phoneNumber:h.value,khatu_website_admin:v.value==="admin",createdAt:O()};let t;s?(delete n.createdAt,t=S(L(m,"users",s),n)):t=z(k(m,"users"),n),t.then(()=>{l(),E()}).catch(a=>console.error("Error saving user: ",a))}function E(){P(),F(k(m,"users")).then(e=>{i=e.docs.map(s=>({id:s.id,...s.data()})),w(i)}).catch(e=>{console.error("Error getting users: ",e),d.innerHTML='<tr><td colspan="5" class="text-center py-10 text-red-500">Error loading users.</td></tr>',r.innerHTML='<p class="text-center py-10 text-red-500 col-span-full">Error loading users.</p>'}).finally(()=>{V()})}function w(e,s=""){const n=e.filter(t=>{const a=s.toLowerCase(),c=(t.name||"").toLowerCase(),u=(t.phoneNumber||"").toLowerCase();return c.includes(a)||u.includes(a)});if(d.innerHTML="",r.innerHTML="",n.length===0){const t='<p class="text-center py-10 col-span-full">No users found.</p>';d.innerHTML=`<tr><td colspan="5">${t}</td></tr>`,r.innerHTML=t;return}n.forEach(t=>{const a=t.createdAt?t.createdAt.toDate().toLocaleDateString():"N/A",c=t.khatu_website_admin===!0,u=(t.name||"?").charAt(0).toUpperCase(),N=`
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-4">
                            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">${u}</div>
                            <div>
                                <div class="text-base font-medium text-text-light dark:text-white">${t.name||"N/A"}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">${t.phoneNumber}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-base text-gray-600 dark:text-gray-400">${a}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${c?'<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/20 text-primary">Admin</span>':'<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">User</span>'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="edit-user-button text-primary hover:text-primary/80" data-user-id="${t.id}">Edit</button>
                    </td>
                </tr>`;d.innerHTML+=N;const H=`
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">${u}</div>
                            <div>
                                <p class="font-bold text-primary dark:text-secondary">${t.name||"N/A"}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${t.phoneNumber}</p>
                            </div>
                        </div>
                        ${c?'<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">Admin</span>':'<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">User</span>'}
                    </div>
                    <div class="text-sm flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-gray-500 dark:text-gray-400">Registered: ${a}</p>
                        <button class="edit-user-button text-primary hover:text-primary/80 font-medium" data-user-id="${t.id}">Edit</button>
                    </div>
                </div>`;r.innerHTML+=H})}LazyLoader.init()});
