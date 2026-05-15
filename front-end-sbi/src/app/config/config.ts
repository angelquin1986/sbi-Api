import {environment} from '../../environments/environment';

// URL Backend Server local
// tslint:disable-next-line:no-var-keyword
// export var URL_SERVICIOS = 'http://localhost:3000';
// export var URL_SERVICIO_SENDMAIL = 'https://development.galavail.com/webservice/booking/sendEmail';

// export var URL_SERVICIOS = 'https://rest.galapagosislands.com';


// URL Backend Server en Produccion
// tslint:disable-next-line:no-var-keyword
export var URL_SERVICIOS = environment.urlServicesServer;


// URL Servicio para nevio de Mail
// export var URL_SERVICIO_SENDMAIL = 'https://rest.galavail.com/webservice/booking/sendEmail';
// tslint:disable-next-line:no-var-keyword
export var URL_SERVICIO_SENDMAIL = environment.urlServiceSendMail;




