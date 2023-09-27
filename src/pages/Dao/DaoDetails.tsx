import React, { useEffect, useState } from "react";
import { Avatar, Divider, Grid, Typography } from "@mui/material";
import axios from "axios";

const DaoDetails: React.FC = () => {
  const [anketler, setAnketler] = useState([
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

  useEffect(() => {
    axios
      .get("https://api.example.com/anketler")
      .then((response) => {
        setAnketler(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const filtrele = () => {
    setAnketler(anketler.filter((anket) => anket.sonDurum === filtre));
  };

  const aramaYap = () => {
    setAnketler(anketler.filter((anket) => anket.baslik.toLowerCase().includes(arama.toLowerCase())));
  };

  return (
    <Grid container spacing={2} minWidth={"100vw"} marginBottom={"40px"}>
      <Grid item xs={3}>
        <div style={{ marginLeft: "25px", backgroundColor: "white", color: "black", borderRadius: "8px", marginTop: "20px" }}>
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
      <Grid item xs={3}></Grid>
      <Grid item xs={6}>
        <div>Proposal</div>
        <div>
          <h2>Anketler</h2>
          <div>
            <input type="text" placeholder="Anket başlığı" onChange={(event) => setArama(event.target.value)} />
            <button onClick={aramaYap}>Ara</button>
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
            <button onClick={filtrele}>Filtrele</button>
          </div>
          <ul>
            {anketler.map((anket) => (
              <li key={anket.id}>
                {anket.baslik} - {anket.sonDurum}
              </li>
            ))}
          </ul>
        </div>
      </Grid>
    </Grid>
  );
};

export default DaoDetails;
