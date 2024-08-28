import { Router } from 'express';
import { container } from '../../../../config/container';
import { MeasureController } from '../../../../infrastructure/http/controllers/MeasureController';

const router = Router();
const measureController = container.get<MeasureController>(MeasureController);

router.post('/upload', (req, res, next) => measureController.uploadMeasure(req, res, next));
router.patch('/confirm', (req, res, next) => measureController.confirmMeasure(req, res, next));
router.get('/:customer_code/list', (req, res, next) => measureController.listMeasures(req, res, next));

export default router;
