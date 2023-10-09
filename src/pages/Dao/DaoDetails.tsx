import React, { useEffect, useState } from "react";
import { Avatar, Divider, Grid, Typography } from "@mui/material";
import axios from "axios";

const DaoDetails: React.FC = () => {
  const [surveys, setSurveys] = useState([
    {
      id: 1,
      baslik: "Yeni survey",
      status: "Draft",
    },
    {
      id: 2,
      baslik: "survey 2",
      status: "Completed",
    },
    {
      id: 3,
      baslik: "survey 3",
      status: "Cancelled",
    },
  ]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [filteredSurveys, setFilteredSurveys] = useState(surveys);

  useEffect(() => {
    axios
      .get("https://api.example.com/surveys")
      .then((response) => {
        setSurveys(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = event.target.value;

    if (newFilter === "") {
      setFilteredSurveys(surveys);
    } else {
      setFilteredSurveys(surveys.filter((survey) => survey.status === newFilter));
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    setSearch(inputValue);

    const filtered = surveys.filter((survey) => survey.baslik.toLowerCase().includes(inputValue.toLowerCase()));
    setFilteredSurveys(filtered);
  };

  return (
    <Grid container spacing={2} minWidth={"100vw"} marginBottom={"40px"}>
      <Grid item xs={1} style={{ marginTop: "20px" }}></Grid>
      <Grid item xs={3} style={{ marginTop: "20px" }}>
        <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>
            <Avatar style={{ marginRight: "10px" }}>Logo</Avatar>
            <Typography>Token Name</Typography>
          </div>
          <Divider />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "20px" }}>
            <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>About</Typography>
            <div>
              <Typography style={{ fontSize: "18px" }}>Name: {} </Typography>
              <Typography style={{ fontSize: "18px" }}>Token: {} </Typography>
              <Typography style={{ fontSize: "18px" }}>Website: {} </Typography>
              <Typography style={{ fontSize: "18px" }}>Program Version: {} </Typography>
              <Typography style={{ fontSize: "18px" }}>X: {} </Typography>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>
            <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>My Governance Power</Typography>
          </div>
        </div>
        <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>
            <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>NFTs</Typography>
          </div>
        </div>
        <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>
            <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>Dao Wallets & Assets</Typography>
          </div>
        </div>
        <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>
            <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>Programs</Typography>
          </div>
        </div>
      </Grid>
      <Grid item xs={1} style={{ marginTop: "20px" }}></Grid>
      <Grid item xs={6} style={{ marginTop: "20px" }}>
        <Typography style={{ padding: "20px" }}>Proposal</Typography>
        <Divider />
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <div>
              <input
                style={{ width: "400px", height: "20px", padding: "10px", borderRadius: "8px", border: "1px solid #000", backgroundColor: "transparent", color: "black" }}
                type="text"
                placeholder="Search Proposals"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(event) => {
                  console.log("event.target.value", event.target.value);
                  handleFilter(event);
                  setFilter(event.target.value);
                }}
              >
                <option value="">All</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
                <option value="Defeated">Defeated</option>
                <option value="Draft">Draft</option>
                <option value="Executable">Executable</option>
                <option value="Executing w/errors">Executing w/errors</option>
                <option value="Signingoff">Signingoff</option>
                <option value="Voting">Voting</option>
                <option value="Vetoed">Vetoed</option>
                <option value="Voting Without Quorum">Voting Without Quorum</option>
              </select>
            </div>
          </div>

          <ul style={{ padding: "20px" }}>
            {filteredSurveys.map((survey) => (
              <li key={survey.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "400px" }}>
                  <div>{survey.baslik}</div>
                  <div
                    style={{
                      color: `${survey.status === "Completed" ? "green" : survey.status === "Draft" ? "yellow" : "red"}`,
                      padding: "5px",
                      borderRadius: "8px",
                    }}
                  >
                    {survey.status}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Grid>
      <Grid item xs={1} style={{ marginTop: "20px" }}></Grid>
    </Grid>
  );
};

export default DaoDetails;
