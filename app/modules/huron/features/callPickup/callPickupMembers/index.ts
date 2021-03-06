import { CallPickupMembersComponent } from './callPickupMembers.component';
import memberService from 'modules/huron/members';
import notifications from 'modules/core/notifications';
import featureMemberService from 'modules/huron/features';

export default angular
  .module('huron.call-pickup.members', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    memberService,
    require('modules/core/config/urlConfig'),
    notifications,
    featureMemberService,
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .component('callPickupMembers',  new CallPickupMembersComponent())
  .name;
