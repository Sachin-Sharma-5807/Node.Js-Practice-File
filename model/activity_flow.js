import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const ActivityFlow= sequelize.define("activity_flow",{
    
    id:{
          type:DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true,
          allowNull:false
    },
    select_activity:{
        type:DataTypes.ENUM("Running","surfing","Basketball","Swimming","Cycling","Racing","Yoga"),
        allowNull:false
    },
    latitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false

    },
    start_time:{
        type:DataTypes.TIME,
        allowNull:false
    },
    duration:{
            type:DataTypes.STRING,
            allowNull:false
    },
    skill_level:{
        type:DataTypes.ENUM("Beginner","Intermidiate","Advanced"),
        allowNull:false
    },
    select_equipment:{
        type:DataTypes.STRING,
        allowNull:true
    },
    people_count:{
        type:DataTypes.INTEGER,
        allowNull:false

    },
    activity_name:{
        type:DataTypes.STRING,
        allowNull:false
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
      }
    },{
        tableName: 'activity_flow',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
  

});
export default ActivityFlow;