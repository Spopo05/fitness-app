import MessageInterface from '../../components/MessageInterface';

const UserMessages = () => {
  return <MessageInterface userRole="user" backPath="/dashboard" />;
};

export default UserMessages;