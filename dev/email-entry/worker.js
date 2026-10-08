// SYNTHETIC LOCAL ONLY. No production configuration references this wrapper.
import worker from '../../src/index.js';
const mailbox=[];let failMail=false;
globalThis.fetch=async(url,opts)=>{
 if(String(url)==='https://challenges.cloudflare.com/turnstile/v0/siteverify'){const b=new URLSearchParams(opts.body);return Response.json({success:b.get('response')==='LOCAL-proof',hostname:'localhost',action:'auth'});}
 if(String(url).startsWith('https://sandbox.api.mailtrap.io/')){if(failMail)return new Response('{}',{status:503});mailbox.push(JSON.parse(opts.body));return Response.json({syntheticLOCAL:true});}
 throw new Error('LOCAL fixture prohibits outbound transport');
};
export default {fetch(req,env,ctx){const u=new URL(req.url);if(!['localhost','127.0.0.1'].includes(u.hostname))return new Response('LOCAL only',{status:503});if(u.pathname==='/__fixture/mail')return Response.json(mailbox);if(u.pathname==='/__fixture/fail-mail' && req.method==='POST'){failMail=u.searchParams.get('enabled')==='1';return Response.json({syntheticLOCAL:true});}return worker.fetch(req,env,ctx);}};
