import {readFile,writeFile} from 'node:fs/promises';
import postcss from 'postcss';

export async function buildStudio(){
 const html=await readFile('source/enquiry-studio/index.html','utf8');
 const start=html.indexOf('<section id="studio"');
 const end=html.indexOf('<section id="instagram"',start);
 if(start<0||end<0)throw new Error('Studio section not found');
 const dialog=html.slice(html.indexOf('<dialog id="reset-dialog"'),html.indexOf('</dialog>')+'</dialog>'.length);
 let markup=html.slice(start,end)+dialog;
 markup=markup.replace(/\b(id|for)="([^"]+)"/g,(_,attr,value)=>`${attr}="studio-${value}"`)
  .replace(/\b(aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g,(_,attr,value)=>`${attr}="${value.split(' ').map(id=>'studio-'+id).join(' ')}"`);
 markup=markup.replace('LET’S CREATE SOMETHING YOURS','THE ENQUIRY STUDIO');
 await writeFile('.build/studio-markup.ts','export default '+JSON.stringify(markup)+';\n');
 const css=postcss.parse(await readFile('source/enquiry-studio/styles.css','utf8'));
 css.walkAtRules('import',rule=>rule.remove());
 css.walkRules(rule=>{rule.selectors=rule.selectors.map(selector=>{
   selector=selector.replace(/#([A-Za-z][\w-]*)/g,'#studio-$1');
   if([':root','body','html'].includes(selector))return '.home-studio';
   return '.home-studio '+selector;
 });});
 const overrides=await readFile('source/enquiry-studio/home.css','utf8');
 return css.toString()+overrides;
}
