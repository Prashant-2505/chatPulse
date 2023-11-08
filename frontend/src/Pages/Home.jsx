import { Box, Button, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const navigate = useNavigate()
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))

    if (userInfo) {
      navigate('/chat')
    }
  }, [navigate])

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m={5}
        borderRadius="lg"
        borderWidth="1px"
        boxShadow="md"
      >
        <Text fontSize="2xl">
          ChatPulse
        </Text>
      </Box>

      <Box bg={"white"} w={"100%"} p={4} borderRadius={"lg"} borderWidth={"1px"}>
        <Tabs variant='soft-rounded' >
          <TabList mb={"1em"}>
            <Tab width={"50%"}>Login</Tab>
            <Tab width={"50%"}>Sign Up</Tab>
          </TabList>

          <TabPanels>

            <TabPanel>
              <Login />
            </TabPanel>

            <TabPanel>
              <Signup />
            </TabPanel>


          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Home;
