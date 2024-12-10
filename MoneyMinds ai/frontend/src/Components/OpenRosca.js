import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Badge } from "antd";
import { useSelector } from "react-redux";

const SidebarContainer = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  width: 400px; /* Adjust the width as needed */
  height: auto; /* Adjust height dynamically */
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

const MemberList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MemberItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  span {
    font-weight: ${(props) => (props.isAdmin ? "bold" : "normal")};
    color: ${(props) => (props.isAdmin ? "#007bff" : "#000")};
  }
`;

const BidList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BidItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const OpenRosca = () => {
  const { roscaId } = useSelector((state) => state.rosca); // Access roscaId from Redux
  const [roscaDetails, setRoscaDetails] = useState(null);

  useEffect(() => {
    if (!roscaId) return; // Exit if no roscaId is available

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

  if (!roscaDetails) {
    return <SidebarContainer>Loading Rosca details...</SidebarContainer>;
  }

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
        <MemberList>
          {roscaDetails.members.map((member, index) => (
            <MemberItem key={index} isAdmin={member.isAdmin}>
              <span>
                {member.name}
                {member.isAdmin && " (Admin)"}
              </span>
              <Badge
                status={member.payment ? "success" : "error"}
                text={member.payment ? "Paid" : "Unpaid"}
              />
            </MemberItem>
          ))}
        </MemberList>
      </Section>

      {/* Bids List */}
      <Section>
        <SubHeading>Bids</SubHeading>
        {roscaDetails.bid.length > 0 ? (
          <BidList>
            {roscaDetails.bid.map((bid, index) => (
              <BidItem key={index}>
                <span>
                  <strong>Name:</strong> {bid.name}
                </span>
                <span>
                  <strong>Amount:</strong> ₹{bid.amount}
                </span>
              </BidItem>
            ))}
          </BidList>
        ) : (
          <p>No bids available.</p>
        )}
      </Section>
    </SidebarContainer>
  );
};

export default OpenRosca;
