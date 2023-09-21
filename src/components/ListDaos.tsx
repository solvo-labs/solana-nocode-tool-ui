import React from "react";
import DaoCard from "./DaoCard";

interface DaoData {
  account: {
    name: string;
  };
}

interface ListDaosProps {
  daos: DaoData[];
  characterLimit: number;
}

const ListDaos: React.FC<ListDaosProps> = ({ daos, characterLimit }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
      {daos.slice(0, 100).map((dao, index) => {
        if (dao.account.name) {
          return (
            <div style={{ padding: "20px", borderRadius: "15px" }} key={index}>
              <DaoCard image={""} name={dao.account.name} characterLimit={characterLimit} />
            </div>
          );
        }
      })}
    </div>
  );
};

export default ListDaos;
