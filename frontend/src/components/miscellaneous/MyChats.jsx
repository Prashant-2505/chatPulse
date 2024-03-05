import { useToast, Box, Button, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender } from '../../config/ChatLogics';
import GroupChatModal from './GroupChatModal';

const MyChats = ({fetchAgain}) => {
  const { user, chats, setChats, setSelectedChat, selectedChat } = ChatState();

  const [loggedUser, setLoggedUser] = useState({}); // Initialize to an empty object

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get('http://localhost:5000/api/chat', config);
      setChats(data);
    } catch (error) {
      toast({
        title: 'Error occurred',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setLoggedUser(userInfo || {}); // Ensure userInfo is an object or default to empty object
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir={'column'}
      alignItems={'center'}
      p={3}
      bg={'white'}
      width={{ base: '100%', md: '31%' }}
      borderRadius={'lg'}
      borderWidth={'1px'}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: '28px', md: '30px' }}
        display={'flex'}
        w={'100%'}
        justifyContent={'space-between'}
        alignContent={'center'}
      >
        My Chats
        <GroupChatModal>
          <Button
            display={'flex'}
            fontSize={{ base: '17px', md: '10px', lg: '17px' }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display={'flex'}
        flexDir={'column'}
        p={3}
        bg={'#F8F8F8'}
        w={'100%'}
        h={'100%'}
        borderRadius={'lg'}
        overflowY={'hidden'}
      >
        {chats ? (
          <Stack overflowY={'scroll'}>
            {chats.map((c) => (
              <Box
                key={c._id}
                onClick={() => setSelectedChat(c)}
                bg={selectedChat === c ? '#38B2AC' : '#E8E8E8'}
                color={selectedChat === c ? 'white' : 'black'}
                px={3}
                py={2}
                borderRadius={'lg'}
                cursor="pointer"  // Add cursor style for indicating it's clickable
                mb={2}  // Add margin-bottom for spacing between chat boxes
              >
                <Text>
                  {!c.isGroupChat ? getSender(loggedUser, c.users) : c.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
