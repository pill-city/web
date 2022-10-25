import RoundAvatar from "../RoundAvatar/RoundAvatar";
import ClickableId from "../ClickableId/ClickableId";
import {pastTime} from "../../utils/timeDelta";
import summary from "../../utils/summary";
import React from "react";
import Notification from "../../models/Notification";
import './NotificationItem.css'
import {useHistory} from "react-router-dom";
import {useAppDispatch} from "../../store/hooks";
import {markNotificationAsRead} from "../../store/notificationsSlice";

interface Props {
  notification: Notification
}

const notificationSummary = (notification: Notification) => {
  if (notification.notifier_blocked) {
     return '...'
   }
  const notification_summary = notification.notifying_summary
  return summary(notification_summary, 100)
}

const notifyingActionToWord = {
  "mention": "mentioned",
  "reshare": "reshared",
  "comment": "commented",
  "reaction": "reacted",
  "follow": "followed"
}

export default (props: Props) => {
  const notification = props.notification
  const history = useHistory()
  const dispatch = useAppDispatch()

  const notificationOnClick = async () => {
    await dispatch(markNotificationAsRead(notification.id))
    history.push(notification.notified_href)
  }

  // todo: this is all duplicate with backend lol
  let notifier
  if (notification.notifier_blocked) {
    notifier = null
  } else if (notification.notifying_action !== "mention") {
    notifier = !notification.notifying_deleted ? notification.notifier : null
  } else {
    notifier = !notification.notified_deleted ? notification.notifier : null
  }

  let action = ''
  if (notifyingActionToWord[notification.notifying_action]) {
    action = notifyingActionToWord[notification.notifying_action]
  }

  let notifiedLocationPronoun
  if (notification.notifying_action === "mention") {
    notifiedLocationPronoun = "their"
  } else {
    notifiedLocationPronoun = "your"
  }

  let notifiedLocationType
  if (notification.notified_href.indexOf("#comment-") !== -1) {
    notifiedLocationType = 'comment'
  } else if (notification.notified_href.indexOf("/post/") !== -1) {
    notifiedLocationType = 'post'
  }

  return (
    <div className="notification-wrapper" style={{
      backgroundColor: notification.unread ? 'white' : '#f0f0f0'
    }}>
      <div className="notification-first-row" onClick={notificationOnClick}>
        <div className="notification-info">
          <div className="post-avatar notification-avatar">
            <RoundAvatar user={notifier}/>
          </div>
          <div className="notification-notifier">
            <div className="notification-notifier-wrapper">
              <b className="notification-notifier-id">
                <ClickableId user={notifier}/>
              </b>
              {' '}
              {action}
              {' '}
              {
                notification.notifying_action === "mention" || notification.notifying_action === "follow" ?
                  "you" :
                  <div className="notification-summary">
                    "{notificationSummary(notification)}"
                  </div>
              }
              {
                notification.notifying_action !== 'follow' &&
                  ` on ${notifiedLocationPronoun} ${notifiedLocationType}`
              }
            </div>
          </div>
        </div>
        <div className="notification-time">
          {pastTime(notification.created_at_seconds)}
        </div>
      </div>

      <div className="notification-second-row" onClick={notificationOnClick}>
        {summary(notification.notified_summary, 150)}
      </div>
    </div>
  )
}
