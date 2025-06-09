import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserSports = sequelize.define("user_sports", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "userId",
  },
  sportsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "sportsId",
  },
  skill_level: {
    type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
    allowNull: false,
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
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "user_sports",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
  paranoid: true, // Enables soft delete
});

export default UserSports;
