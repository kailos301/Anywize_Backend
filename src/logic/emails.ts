import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import debug from 'debug';

const Debug = debug('anywize:emails');

const getEmailContent = async (supplier: Supplier) => new Promise((resolve, reject) => {
  ejs.renderFile(`${process.cwd()}/templates/route-started-email.ejs`, { supplier }, {}, (err, str) => {
    if (err) {
      return reject(err);
    }

    return resolve(str);
   });
});

const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.de',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@anywize.io',
    pass: 'Wywza5-wujvyv-digvut',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default {
  notifyRouteStarted: async (customer: Customer, supplier: Supplier) => {
    if (!customer.email_notifications || process.env.NODE_ENV === 'test') {
      return Promise.resolve();
    }

    const html = await getEmailContent(supplier);

    Debug(`Notifying route started via email to customer ${customer.id} at ${customer.email}`);

    try {
      await transporter.sendMail({
        from: {
          name: 'Anywize Lieferung',
          address: 'no-reply@anywize.io',
        },
        to: customer.email,
        subject: 'Auslieferung gestartet',
        html,
      });
    } catch (err) {
      Debug(err.message);
      Debug(err.stack);
    }
  },
};
