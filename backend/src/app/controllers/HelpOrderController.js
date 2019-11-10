import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const help_order = await HelpOrder.findAll({
      limit: 2,
      offset: (page - 1) * 2,
      order: [['id', 'DESC']],
    });

    return res.json(help_order);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const { id } = req.params;
    const { question } = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const help_order = await HelpOrder.create({
      student_id: id,
      question,
    });

    return res.json(help_order);
  }
}

export default new HelpOrderController();
