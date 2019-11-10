import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';

class AnswerController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Answer is required.' });
    }

    const { id } = req.params;
    const { answer } = req.body;

    const help_order = await HelpOrder.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!help_order) {
      return res.status(400).json({ error: 'Help Order does not exists.' });
    }

    if (help_order.answer !== null) {
      return res
        .status(400)
        .json({ error: 'Help Order has already been answered.' });
    }

    const answerr = await help_order.update({ answer, answer_at: new Date() });

    await Queue.add(AnswerMail.key, {
      help_order,
      answerr,
    });

    return res.json(answerr);
  }
}

export default new AnswerController();
