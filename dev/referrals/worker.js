// SYNTHETIC LOCAL ONLY entrypoint: never referenced by production configuration.
import worker from '../../src/index.js';
const mailbox=[];
globalThis.fetch=async(url,opts)=>{
 if(String(url)==='https://challenges.cloudflare.com/turnstile/v0/siteverify')return Response.json({success:true,hostname:'localhost',action:'auth'});
 if(String(url).startsWith('https://sandbox.api.mailtrap.io/')){mailbox.push(JSON.parse(opts.body));return Response.json({synthetic:true});}
 throw new Error('LOCAL fixture prohibits outbound transport');
};
export default {fetch(req,env,ctx){if(!['localhost','127.0.0.1'].includes(new URL(req.url).hostname))return new Response('LOCAL only',{status:503});if(new URL(req.url).pathname==='/__fixture/mail')return Response.json(mailbox);return worker.fetch(req,env,ctx);}};
