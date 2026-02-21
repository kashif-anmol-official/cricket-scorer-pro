import { Router } from 'express';
import { createMatch, getMatch, addBallEvent, undoLastEvent, updatePlayer, startNextInnings } from '../controllers/matchController';

const router = Router();

router.post('/', createMatch);
router.get('/:id', getMatch);
router.post('/:id/events', addBallEvent);
router.post('/:id/next-innings', startNextInnings);
router.delete('/:id/events/last', undoLastEvent);
router.patch('/players/:id', updatePlayer);

export default router;
