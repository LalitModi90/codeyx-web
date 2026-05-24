import { Router } from 'express';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  revokeFriendRequest,
  removeFriend,
  getFriendsList, 
  getPendingRequests 
} from '../controllers/social.controller';
import { withClerkAuth, protectRoute } from '../middlewares/clerk.middleware';

const router = Router();

// Apply withClerkAuth first to parse the token, then protectRoute to enforce it
router.post('/request', withClerkAuth, protectRoute, sendFriendRequest);
router.post('/accept', withClerkAuth, protectRoute, acceptFriendRequest);
router.post('/reject', withClerkAuth, protectRoute, rejectFriendRequest);
router.post('/revoke', withClerkAuth, protectRoute, revokeFriendRequest);
router.delete('/remove', withClerkAuth, protectRoute, removeFriend);
router.get('/friends', withClerkAuth, protectRoute, getFriendsList);
router.get('/requests', withClerkAuth, protectRoute, getPendingRequests);

export default router;
