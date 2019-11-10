import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class WelcomeMail {
  get key() {
    return 'WelcomeMail';
  }

  async handle({ data }) {
    const { student, plan, enrollment } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Bem vindo ao Gympoint',
      template: 'welcome',
      context: {
        student: student.name,
        title: plan.title,
        duration:
          plan.duration === 1
            ? `${plan.duration} mês`
            : `${plan.duration} meses`,
        expiration_date: format(parseISO(enrollment.end_date), 'dd/MM/yyyy'),
        price: plan.price * plan.duration,
      },
    });
  }
}

export default new WelcomeMail();
