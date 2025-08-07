# Airport Mapping (updated 2025-08-04)

This is a very early form of a TravelMapping-adjacent idea for mapping airports visited. The current site is found here: https://tmairports.teresco.org/AirportData/air/web/index.html

<img align="left" width="100" height="100" src="https://travelmapping.github.io/AirportData/images/LAX(3).png"> The current output is simple: symbols at airports worldwide that show a user's visits to that airport. Users who have departed an airport will see a green upward-pointing triangle, and users who have arrived at an airport will see one in red pointing downward. Airports where users experienced a layover (with or without a plane change) appear as a blue circle surrounding the triangles.

## How to create a map

Maps are generated from "alist" files submitted via GitHub. The filename should be [username].alist. In the file, user data should use the following format:

[IATA Airport Code] [N] [N]* [N]*

*the third and fourth fields are optional.

N can be any of the following codes: A (for arrival), D (for departure), and L (for layover).

**Example file lines:**

| Code       | Meaning                                                                 |
|------------|-------------------------------------------------------------------------|
| `ATL A D L`| Traveler arrived at and departed from Atlanta, and had a layover there. |
| `LAX A D`  | Traveler arrived at and departed from Los Angeles.                      |
| `ORD L`    | Traveler had a layover at Chicago O'Hare, but no arrival or departure.  |

Each airport should be on a separate line. The order of the A, D, and L does not matter. The file should be submitted via a GitHub pull request, currently to TravelMapping/AirportData/air/data (email submissions will be available soon but are not currently supported). Once the file is merged, their map will update automatically.

If you have visited an airport not currently included in the project, please put it in your alist anyway. When your alist is processed, unknown airports are flagged for addition to the airport database (airports.csv) and will get added as part of the update process.

When you receive a notification that your alist has been pulled in, expect to see your updated map on Airport Mapping at the next :15 past the hour.

## The map

The user's airport map will appear at https://tmairports.teresco.org/AirportData/air/web/user.html?user=[usernamre]. A list of all users can be found via the link at the top of that page, or at https://tmairports.teresco.org/AirportData/air/web/user.html (without the user parameter).

There is only one option for the map currently (show all airports, or only visited airports). More may be added.

Clicking on the icon will identify the airport with a popup message. The popup will include a link to that airport's page, which includes a list of all users who have visited that airport.

The map of all airports currently included is located at https://tmairports.teresco.org/AirportData/air/web/airports.html. This page provides a locator map for all airports (color-coded by number of visitors) and a table with the same information.

## Known issues:

* After a user's .alist is updated, the browser cache must be cleared manually in order to see the updated map.
* Many airports are missing. So far only airports visited by at least one user have been added.
* Airport placement is inconsistent. Some icons are centered on runways, some on terminals, and some at other positions on airport property. Many locations were automatically generated using Copilot.

## Future plans:

* Additional basemaps may become available.
* The map currently shows any airports requested by users. This may become difficult to maintain. A decision will need to be reached regarding which airports should be included. Public airports with scheduled commercial flights are the main scope for the project, but "public", "scheduled", and "commercial" may need to be clarified.
* Other information (such as city and state) may be added to the data identifying airports.
