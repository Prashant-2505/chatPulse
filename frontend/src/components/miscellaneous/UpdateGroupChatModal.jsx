import React, { useState } from 'react';
import { useDisclosure } from '@chakra-ui/hooks';
import { ViewIcon } from '@chakra-ui/icons';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    IconButton,
    useToast,
    Box,
    FormControl,
    Input,
    Spinner,
} from '@chakra-ui/react';
import { ChatState } from '../../context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain,fetchMessages }) => {
    const [groupChatName, setGroupChatName] = useState('');
    const [renameloading, setRenameLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { selectedChat, setSelectedChat, user } = ChatState();

    const handleRename = async () => {
        try {
            if (!groupChatName) {
                toast({
                    title: 'Error',
                    description: 'Group chat name cannot be empty.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'bottom',
                });
                return;
            }

            setRenameLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(`http://localhost:5000/api/chat/grouprename`, {
                chatId: selectedChat._id,
                chatName: groupChatName,
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
        } catch (error) {
            toast({
                title: 'Error Occurred',
                description: error.response ? error.response.data.message : 'Network error',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
        } finally {
            setRenameLoading(false);
        }
    };

    const handleRemove = async(user1) => {
        if(selectedChat.groupAdmin._id !== user._id && user1._id !== user._id)
        {
            toast({
                title: 'Only admins can add user',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
            return;
        }

        try {
            setLoading(true)
            const { data } = await axios.put(`http://localhost:5000/api/chat/groupremove`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id
                }
                , {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

            user1._id === user._id ? setSelectedChat():setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            fetchMessages()
            setLoading(false)
        } catch (error) {
            toast({
                title: 'error occured while removing user',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
            return;
        }
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) return;

        try {
            setLoading(true);
            const { data } = await axios.get(`http://localhost:5000/api/user?search=${query}`, {
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

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: 'User already exist',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
            return;
        }
        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: 'Only admins can add user',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
            return;
        }

        try {
            setLoading(true)
            const { data } = await axios.put(`http://localhost:5000/api/chat/groupadd`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id
                }
                , {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

            setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            setLoading(false)
        } catch (error) {
            toast({
                title: 'error occured while adding user',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
            return;
        }
    }



    return (
        <>
            <IconButton display={{ base: 'flex' }} icon={<ViewIcon />} onClick={onOpen}>
                Open Modal
            </IconButton>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" display="flex" justifyContent="center">
                        {selectedChat.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                            {selectedChat.users.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))}
                        </Box>

                        <FormControl display="flex">
                            <Input
                                placeholder="Chat name"
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameloading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>

                        <FormControl display="flex">
                            <Input
                                placeholder="add user to group"
                                mb={3}
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        {loading ? (
                            <Spinner size={'lg'} />

                        )
                            : (
                                searchResult.map((u) => (
                                    <UserListItem
                                        key={u._id}
                                        user={u}
                                        handleFunction={() => handleAddUser(u)}
                                    />
                                ))
                            )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={handleRemove}>
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateGroupChatModal;
