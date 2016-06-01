# itpHeatMap

## Realtime 3D heat map

This component showed a 3D model of the ITP floor. The height and colour was determined by the power consumption at that moment.

### Tools Used
* NodeJS
* ThreeJS
* D3
* Moment.js

### Code Components

**3D floor map**

* The function that queried the power per room on the floor was called every minute.
* Using the floor schema, the call using the sublocationID was made for each room. (/floordata_itp)
* On clicking on any of the rooms, another function call was made which got the power being consumed in each of the equipments in that room.
* For this, the equipmentIDs are taken from the schema and the call is made. (/floordata_itp)


## Power consumption over the last month

**Line Graph of past data**

* Currently we are storing past data in a file.
* The latest data update is got in through the API (/floordata_itp) and it is also updated every minute.
* Comparisions on top get updated based on the selected time period.
