import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { help_order, answerr } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${help_order.student.name} <${help_order.student.email}>`,
      subject: 'Pergunta Respondida',
      template: 'answer',
      context: {
        student: help_order.student.name,
        question: answerr.question,
        answer: answerr.answer,
      },
    });
  }
}

export default new AnswerMail();
