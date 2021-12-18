const neoDriver = require("./neodriver");

const addComplaintToUser = async (user_id, complaintInfo) => {
  try {
    const { lat, long, complaint_id } = complaintInfo;
    const session1 = neoDriver.session();
    const result = await session1.run(
      "CREATE (a:Complaint { lat:$lat, long:$long,  complaint_id:$complaint_id}) RETURN a",
      {
        lat: lat,
        long: long,
        complaint_id: complaint_id,
      }
    );
    console.log("complaint ID is:", complaint_id);
    console.log("user ID is neo", user_id);
    let temp_complaint_id = "";
    result.records.forEach((r) => {
      temp_complaint_id = r._fields[0].properties.complaint_id;
    });
    // const session2 = neoDriver.session();
    const res = await session1.run(
      "MATCH (a:User {user_id:$user_id}), (b:Complaint {complaint_id:$complaint_id}) CREATE (a)-[r:reports]->(b) return a",
      { user_id: user_id, complaint_id: temp_complaint_id }
    );
    console.log(res);
    session1.close();
  } catch (error) {
    throw error;
  }
};

module.exports = { addComplaintToUser };
