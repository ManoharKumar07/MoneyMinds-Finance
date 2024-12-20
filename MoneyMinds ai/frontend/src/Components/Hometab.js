import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux"; // Import useDispatch
import { message } from "antd";
import { setRoscaId } from "../redux/features/roscaSlice"; // Import the setRoscaId action

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 16px;
`;

const RoscaCard = styled.div`
  width: 30%;
  margin: 16px 0;
  box-sizing: border-box;
`;

const CardContent = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 10px;
  }

  p {
    margin: 8px 0;
  }

  button {
    background-color: green;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;

  button {
    margin: 0 4px;
    padding: 8px 12px;
    cursor: pointer;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    border-radius: 4px;
  }

  button.active {
    background-color: #007bff;
    color: #fff;
    border: 1px solid #007bff;
  }
`;

const Hometab = ({ setActive }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch(); // Initialize useDispatch
  const [roscas, setRoscas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const roscasPerPage = 3;

  useEffect(() => {
    const fetchRoscas = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/v1/user/getallrosca"
        );
        if (response.data.success) {
          setRoscas(response.data.roscas);
        }
      } catch (error) {
        console.error("Error fetching roscas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoscas();
  }, []);

  const handleJoinRosca = async (roscaId) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/user/join",
        {
          id: roscaId,
          username: user.name,
        }
      );

      if (response.data.success) {
        message.success(response.data.message);
        setRoscas((prevRoscas) =>
          prevRoscas.map((rosca) =>
            rosca._id === roscaId
              ? {
                  ...rosca,
                  members: [
                    ...rosca.members,
                    { name: user.name, payment: false },
                  ],
                }
              : rosca
          )
        );
      }
    } catch (error) {
      console.error("Error joining Rosca:", error);
      message.error(error.response?.data?.message || "Failed to join Rosca");
    }
  };

  const indexOfLastRosca = currentPage * roscasPerPage;
  const indexOfFirstRosca = indexOfLastRosca - roscasPerPage;
  const currentRoscas = roscas.slice(indexOfFirstRosca, indexOfLastRosca);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRoscaClick = (roscaId) => {
    setActive(8); // Set active to 8 on click
    console.log(roscaId);
    dispatch(setRoscaId(roscaId)); // Dispatch the roscaId to Redux store
  };

  return (
    <div>
      <h2 style={{ marginBottom: "16px" }}>All Roscas</h2>
      {loading ? (
        <p>Loading...</p>
      ) : roscas.length === 0 ? (
        <p>No roscas found.</p>
      ) : (
        <>
          <Container>
            {currentRoscas.map((rosca) => (
              <RoscaCard
                key={rosca._id}
                onClick={() => handleRoscaClick(rosca._id)} // Pass roscaId to the click handler
              >
                <CardContent>
                  <h3>{rosca.roscaName}</h3>
                  <p>Size: {rosca.size}</p>
                  <p>Amount: {rosca.amount}</p>
                  <p>Duration: {rosca.duration}</p>
                  <p>Admin: {rosca.isAdmin ? "Yes" : "No"}</p>
                  <p>Members: {rosca.members.length}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering handleRoscaClick
                      handleJoinRosca(rosca._id);
                    }}
                    disabled={rosca.members.some(
                      (member) => member.name === user.name
                    )}
                  >
                    {rosca.members.some((member) => member.name === user.name)
                      ? "Joined"
                      : "Join"}
                  </button>
                </CardContent>
              </RoscaCard>
            ))}
          </Container>
          <Pagination>
            {[...Array(Math.ceil(roscas.length / roscasPerPage))].map(
              (_, index) => (
                <button
                  key={index + 1}
                  className={currentPage === index + 1 ? "active" : ""}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              )
            )}
          </Pagination>
        </>
      )}
    </div>
  );
};

export default Hometab;
