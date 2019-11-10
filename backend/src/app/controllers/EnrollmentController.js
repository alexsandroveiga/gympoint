import { addMonths, parseISO } from 'date-fns';
import * as Yup from 'yup';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

import WelcomeMail from '../jobs/WelcomeMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async index(req, res) {
    const enrollment = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(enrollment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findOne({
      where: { id: student_id },
    });

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    const HasAnEnrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    if (HasAnEnrollment) {
      return res
        .status(400)
        .json({ error: 'Student already has already an enrollment.' });
    }

    const parsedDate = parseISO(start_date);
    const end_date = addMonths(parsedDate, plan.duration);
    const price = plan.price * plan.duration;

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: parsedDate,
      end_date,
      price,
    });

    await Queue.add(WelcomeMail.key, {
      student,
      plan,
      enrollment,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findOne({
      where: { id: student_id },
    });

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    const enrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);
    const price = plan.price * plan.duration;

    const { id } = await enrollment.update({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json({
      id,
      student_id,
      plan_id,
      start_date: parseISO(start_date),
      end_date,
    });
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found.' });
    }

    await enrollment.destroy();

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
