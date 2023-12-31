import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { removeNotification } from '../redux/slices/notificationsSlice';
import Notification from './Notification';

export default function Notifications() {
  const notifications = useAppSelector((state) => state.notifications.value);
  const dispatch = useAppDispatch();
  const dismissNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <>
      <div
        aria-live="assertive"
        className="fixed left-0 bottom-0 sm:bottom-5 sm:right-5 right-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {notifications.map((notification) => {
            return Notification(notification, dismissNotification);
          })}
        </div>
      </div>
    </>
  );
}
