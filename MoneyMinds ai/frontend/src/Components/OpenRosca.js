import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useSelector } from "react-redux";

const SidebarContainer = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  width: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h2`
  margin-bottom: 20px;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SubHeading = styled.h3`
  margin-bottom: 10px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

const ButtonStyled = styled.button`
  min-width: 120px;
  font-weight: bold;
  padding: 10px;
  background-color: ${(props) => props.color || "#007bff"};
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const OpenRosca = ({ setActive }) => {
  const { roscaId } = useSelector((state) => state.rosca);
  const currentUser = useSelector((state) => state.user.user?.name); // Current user's name from Redux
  const [roscaDetails, setRoscaDetails] = useState(null);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    if (!roscaId) return;

    const fetchRoscaDetails = async () => {
      try {
        const response = await axios.post(
          `http://localhost:8080/api/v1/user/openrosca/${roscaId}`
        );

        if (response.data.success) {
          setRoscaDetails(response.data.rosca);
        }
      } catch (error) {
        console.error("Error fetching Rosca details:", error);
      }
    };

    fetchRoscaDetails();
  }, [roscaId]);

  const handleMakeBid = async () => {
    const numericBidAmount = Number(bidAmount);
    console.log("mmmmmm", numericBidAmount);

    if (!numericBidAmount || isNaN(numericBidAmount) || numericBidAmount <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/user/makebid",
        {
          username: currentUser,
          roscaId,
          bidAmount: numericBidAmount,
        }
      );

      if (response.data.success) {
        alert("Bid placed successfully!");
        setRoscaDetails((prev) => ({
          ...prev,
          bid: [...prev.bid, { name: currentUser, amount: numericBidAmount }],
        }));
        setBidModalVisible(false);
        setBidAmount("");
      }
    } catch (error) {
      console.error("Error adding bid:", error);
      alert("Failed to place bid. Please try again.");
    }
  };

  const handleMakePayment = () => {
    setActive(9);
  };

  const isCurrentUserAdmin = roscaDetails?.members?.some(
    (member) =>
      member.isAdmin &&
      member.name.toLowerCase() === (currentUser || "").toLowerCase()
  );

  const hasCurrentUserPaid = roscaDetails?.members?.some(
    (member) => member.name === currentUser && member.payment
  );

  if (!roscaDetails) {
    return <SidebarContainer>Loading Rosca details...</SidebarContainer>;
  }

  return (
    <SidebarContainer>
      <Heading>Rosca Details</Heading>

      <Section>
        <SubHeading>Basic Details</SubHeading>
        <p>
          <strong>Name:</strong> {roscaDetails.roscaName}
        </p>
        <p>
          <strong>Size:</strong> {roscaDetails.size}
        </p>
        <p>
          <strong>Amount:</strong> ₹{roscaDetails.amount}
        </p>
        <p>
          <strong>Duration:</strong> {roscaDetails.duration}
        </p>
      </Section>

      <Section>
        <SubHeading>Members</SubHeading>
        {roscaDetails.members.map((member) => (
          <div key={member._id}>
            <span>
              {member.name}
              {member.isAdmin && " (Admin)"}
            </span>
            <span
              style={{
                color: member.payment ? "green" : "red",
                textAlign: "right",
              }}
            >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {member.payment ? "Paid" : "Unpaid"}
            </span>
          </div>
        ))}
      </Section>

      <Section>
        <SubHeading>Bids</SubHeading>
        {roscaDetails.bid.length > 0 ? (
          roscaDetails.bid.map((bid, index) => (
            <div key={index}>
              <p>
                <strong>Name:</strong> {bid.name}
              </p>
              <p>
                <strong>Amount:</strong> ₹{bid.amount}
              </p>
            </div>
          ))
        ) : (
          <p>No bids available.</p>
        )}
      </Section>

      <ButtonContainer>
        {!hasCurrentUserPaid && (
          <ButtonStyled color="#28a745" onClick={handleMakePayment}>
            Make Payment
          </ButtonStyled>
        )}
        {hasCurrentUserPaid && (
          <ButtonStyled color="#ffc107" disabled>
            Payment Done
          </ButtonStyled>
        )}

        <ButtonStyled color="#007bff" onClick={() => setBidModalVisible(true)}>
          Make Bid
        </ButtonStyled>

        {isCurrentUserAdmin && (
          <ButtonStyled color="#dc3545">Allocate Bid</ButtonStyled>
        )}
      </ButtonContainer>

      {bidModalVisible && (
        <ModalOverlay>
          <ModalContent>
            <h3>Enter Bid Amount</h3>
            <input
              type="number"
              placeholder="Enter your bid amount"
              value={bidAmount}
              onChange={async (e) => {
                await setBidAmount(e.target.value);
                console.log(bidAmount);
              }}
            />
            <div style={{ marginTop: "20px" }}>
              <ButtonStyled color="#007bff" onClick={handleMakeBid}>
                Submit
              </ButtonStyled>
              <ButtonStyled
                color="#dc3545"
                onClick={() => setBidModalVisible(false)}
              >
                Cancel
              </ButtonStyled>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </SidebarContainer>
  );
};

export default OpenRosca;
