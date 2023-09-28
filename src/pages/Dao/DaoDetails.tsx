import React, { useEffect, useState } from "react";
import { Avatar, Divider, Grid, Typography } from "@mui/material";
import axios from "axios";

const DaoDetails: React.FC = () => {
  const [surveys, setSurveys] = useState([
    {
      id: 1,
      baslik: "Yeni Anket",
      sonDurum: "Draft",
    },
    {
      id: 2,
      baslik: "Anket 2",
      sonDurum: "Completed",
    },
    {
      id: 3,
      baslik: "Anket 3",
      sonDurum: "Cancelled",
    },
  ]);
  const [filtre, setFiltre] = useState("");
  const [arama, setArama] = useState("");
  const [filteredSurveys, setFilteredSurveys] = useState(surveys);

  useEffect(() => {
    axios
      .get("https://api.example.com/anketler")
      .then((response) => {
        setSurveys(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleFilter = () => {
    if (filtre === "") {
      // Filtre boşsa, tüm anketleri göster
      setFilteredSurveys(surveys);
    } else {
      // Filtre doluysa, filtreye uygun anketleri göster
      setFilteredSurveys(surveys.filter((survey) => survey.sonDurum === filtre));
    }
  };

  const handleSearch = () => {
    if (arama === "") {
      // Arama boşsa, tüm anketleri göster
      setFilteredSurveys(surveys);
    } else {
      // Arama doluysa, başlığa göre ara
      const filtered = surveys.filter((survey) => survey.baslik.toLowerCase().includes(arama.toLowerCase()));
      setFilteredSurveys(filtered);
    }
  };

  return (
    <Grid container spacing={2} minWidth={"100vw"} marginBottom={"40px"}>
      <Grid item xs={3} style={{ marginTop: "20px" }}>
        <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px" }}>
            <Avatar style={{ marginRight: "10px" }}>Logo</Avatar>
            <Typography>Token Name</Typography>
          </div>
          <Divider />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "20px" }}>
            <Typography style={{ fontWeight: "bold", marginBottom: "10px", textDecoration: "underline" }}>About</Typography>
            <Typography style={{ fontSize: "18px" }}>Name: {} </Typography>
            <Typography style={{ fontSize: "18px" }}>Token: {} </Typography>
            <Typography style={{ fontSize: "18px" }}>Website: {} </Typography>
            <Typography style={{ fontSize: "18px" }}>Program Version: {} </Typography>
            <Typography style={{ fontSize: "18px" }}>X: {} </Typography>
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
      <Grid item xs={8} style={{ marginTop: "20px" }}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>Proposal</div>
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <div style={{}}>
              <input type="text" placeholder="Anket başlığı" onChange={(event) => setArama(event.target.value)} />
              <button onClick={handleSearch}>Ara</button>
            </div>
            <div>
              <select value={filtre} onChange={(event) => setFiltre(event.target.value)}>
                <option value="">Tümü</option>
                <option value="Cancelled">İptal Edilmiş</option>
                <option value="Completed">Tamamlanmış</option>
                <option value="Defeated">Reddedilmiş</option>
                <option value="Draft">Taslak</option>
                <option value="Executable">Yürütülebilir</option>
                <option value="Executing w/errors">Hatalarla Çalışıyor</option>
                <option value="Signingoff">Onaylanıyor</option>
                <option value="Voting">Oylama</option>
                <option value="Vetoed">Veto Edilmiş</option>
                <option value="Voting Without Quorum">Oylama Yetersiz Çoğunluk</option>
              </select>
              <button onClick={handleFilter}>Filtrele</button>
            </div>
          </div>

          <ul>
            {filteredSurveys.map(
              (
                survey // filteredSurveys'ı kullanın
              ) => (
                <li key={survey.id}>
                  {survey.baslik} - {survey.sonDurum}
                </li>
              )
            )}
          </ul>
        </div>
      </Grid>
    </Grid>
  );
};

export default DaoDetails;
