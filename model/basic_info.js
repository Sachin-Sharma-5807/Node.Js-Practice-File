
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserProfile = sequelize.define(
  "basic_info", // Model name (unused at table time because we specify `tableName`)
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
  
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   
    additional_img_path: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "dob",
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "basic_info",  
    timestamps: true,         
    createdAt: "created_at",   
    updatedAt: "updated_at",   
    freezeTableName: true,     
  }
);

export default UserProfile;