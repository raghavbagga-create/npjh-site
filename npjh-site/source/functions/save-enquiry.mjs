import {getStore} from '@netlify/blobs';
import {createEnquiryHandler} from './enquiry-handler.mjs';

export default createEnquiryHandler(() => getStore('customer-enquiries'));
export const config = {
  rateLimit: {windowLimit:10, windowSize:60, aggregateBy:['ip', 'domain'], action:'rate_limit'}
};
