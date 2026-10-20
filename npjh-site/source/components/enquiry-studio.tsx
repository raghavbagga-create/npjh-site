"use client";
import {memo,useEffect,useRef} from 'react';
import {mountEnquiryStudio} from '../enquiry-studio/controller';
import studioMarkup from '../../.build/studio-markup';

const content={__html:studioMarkup};
function EnquiryStudio(){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>root.current?mountEnquiryStudio(root.current,'studio-'):undefined,[]);
 return <div ref={root} id="enquiry-studio" className="home-studio" dangerouslySetInnerHTML={content}/>;
}

export default memo(EnquiryStudio);
