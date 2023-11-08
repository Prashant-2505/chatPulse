import React, { useState } from 'react';
import {
    Button,
    FormControl,
    Input,
    useDisclosure,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Box,
} from '@chakra-ui/react';
import axios from 'axios';
import { ChatState } from '../../context/ChatProvider';
import UserListItem from '../../components/UserAvatar/UserListItem'
import UserBadgeItem from '../UserAvatar/UserBadgeItem';

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const { user, chats, setChats } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) return;

        try {
            setLoading(true);
            const { data } = await axios.get(`/api/user?search=${query}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setLoading(false);
            setSearchResult(data);
            console.log(searchResult);
        } catch (error) {
            toast({
                title: 'Error occurred while searching user',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom-left',
            });
        }
    };

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: 'Please fill all the fields',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom-left',
            });
            return
        }

        try {
            const { data } = await axios.post(`/api/chat/group`,
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map(u => u._id))
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

            setChats([data, ...chats])
            onClose()
            toast({
                title: 'New Group Chat Created',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'bottom-left',
            });
            return

        } catch (error) {
            toast({
                title: 'Error occured',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom-left',
            });

        }
    };

    const handleGroup = (user) => {
        if (selectedUsers.includes(user)) {
            toast({
                title: 'User already added',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom-left',
            });
            return
        }
        else {
            setSelectedUsers([...selectedUsers, user])
        }
    }

    const handleDelete = (user) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id !== user._id))
    }

    return (
        <>
            <Button onClick={onOpen}>Group Chat</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={'35px'}
                        display={'flex'}
                        justifyContent={'center'}
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={'flex'} flexDir={'column'} alignItems={'center'}>
                        <FormControl>
                            <Input
                                placeholder='Chat Name'
                                mr={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                                value={groupChatName}
                            />
                            <Input
                                placeholder='Add User eg: user1, user2'
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                                value={search}
                            />
                        </FormControl>

                        <Box width={'100%'} display={'flex'} flexWrap={'wrap'}>
                            {selectedUsers.map(user => (
                                <UserBadgeItem key={user._id} user={user} handleFunction={() => handleDelete(user)} />
                            ))}
                        </Box>

                        {loading ? <div>Loading</div> : (
                            searchResult?.slice(0, 4).map(user =>
                            (
                                <UserListItem key={user._id} user={user}
                                    handleFunction={(() => handleGroup(user))}
                                />
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default GroupChatModal;
