import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Badge, Button, message } from "antd";
import { useSelector } from "react-redux";

const SidebarContainer = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  width: 400px;
  height: auto;
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

const ButtonStyled = styled(Button)`
  min-width: 120px;
  font-weight: bold;
`;

const OpenRosca = ({ setActive }) => {
  const { roscaId } = useSelector((state) => state.rosca);
  const currentUser = useSelector((state) => state.user.name); // Current user's name from Redux
  const [roscaDetails, setRoscaDetails] = useState(null);

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
        console.error("Error fetching rosca details:", error);
      }
    };

    fetchRoscaDetails();
  }, [roscaId]);

  const handleMakePayment = async () => {
    setActive(9); // Set active step to 9
  };

  if (!roscaDetails) {
    return <SidebarContainer>Loading Rosca details...</SidebarContainer>;
  }

  // Check if the current user is the admin
  const isCurrentUserAdmin = roscaDetails.members.some(
    (member) => member.isAdmin && member.name === currentUser
  );

  // Check if the current user has made payment
  const hasCurrentUserPaid = roscaDetails.members.some(
    (member) => member.name === currentUser && member.payment
  );

  return (
    <SidebarContainer>
      <Heading>Rosca Details</Heading>

      {/* Basic Rosca Details */}
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
        <p>
          <strong>Aadhar Number:</strong>{" "}
          {roscaDetails.aadharNo || "Not Provided"}
        </p>
      </Section>

      {/* Members List */}
      <Section>
        <SubHeading>Members</SubHeading>
        {roscaDetails.members.map((member) => (
          <div key={member._id}>
            <span>
              {member.name}
              {member.isAdmin && " (Admin)"}
            </span>{" "}
            <Badge
              status={member.payment ? "success" : "error"}
              text={member.payment ? "Paid" : "Unpaid"}
            />
          </div>
        ))}
      </Section>

      {/* Bids List */}
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

      {/* Buttons */}
      <ButtonContainer>
        {/* Only show the "Make Payment" button with an onClick */}
        {!hasCurrentUserPaid && (
          <ButtonStyled
            type="primary"
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
            onClick={handleMakePayment} // Trigger the "Make Payment" functionality
          >
            Make Payment
          </ButtonStyled>
        )}
        {hasCurrentUserPaid && (
          <ButtonStyled
            type="default"
            style={{ backgroundColor: "#ffc107", borderColor: "#ffc107" }}
            disabled
          >
            Payment Done
          </ButtonStyled>
        )}

        {/* Other buttons without onClick */}
        <ButtonStyled
          type="primary"
          style={{ backgroundColor: "#007bff", borderColor: "#007bff" }}
        >
          Make Bid
        </ButtonStyled>

        {isCurrentUserAdmin && (
          <ButtonStyled
            type="danger"
            style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
          >
            Allocate Bid
          </ButtonStyled>
        )}
      </ButtonContainer>
    </SidebarContainer>
  );
};

export default OpenRosca;
