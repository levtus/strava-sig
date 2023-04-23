const clientId = '98135';
const clientSecret = '250fb83eda23244fd4a165a4a8565f398a5e1e56';
var code;
var userData
var data
var accessToken
var activityData

window.addEventListener("load", (event) => {
    getURLCode()
    if (code) {
        console.log('Code Found on Load') 
        getAccessToken(code)
    } else {
        console.log('Code Not Present on Load') 
    }
});

// Redirect the user to the Strava authorization page
function authenticate() {
  console.log('Starting Auth Sequence')
  const redirectUri = 'https://levtus.github.io/strava-sig';
  const responseType = 'code';
  const scope = 'read,activity:read';
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
  window.location.href = authUrl;
}

$("#connectButton").click(function () {
    authenticate()
})



// Get the authorization code from the URL
function getURLCode() {
    const urlParams = new URLSearchParams(window.location.search);
    code = urlParams.get('code');
    if (code) {
        console.log(code)
        return code
    }
}

// Exchange the authorization code for an access token
async function getAccessToken(code) {
  const tokenUrl = 'https://www.strava.com/oauth/token';
  if (!data || !data.access_token) {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code', 
      }),
    });
    data = await response.json(); 
    console.log("Access Token = " + data.access_token)
  } else {
    console.log("Access Token Already Ready") 
  }
  accessToken = data.access_token;
  return accessToken;
}

async function getUserData() {
    if (!userData) {
        const apiUrl = 'https://www.strava.com/api/v3/athlete';
        const response = await fetch(apiUrl, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            },
        });
        userData = await response.json();
        console.log("User Profile Information: " + userData);
        return userData;
    } else {
        console.log("User profile information already present: " + userData)
    }
}

async function getUserStats(id) {
    if (!activityData) {
        const apiUrl = `https://www.strava.com/api/v3/athletes/${id}/stats`;
        const response = await fetch(apiUrl, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            },
        });
        userStats = await response.json();
        console.log("User Activity Statistics: " + userStats);
        return userStats;
    } else {
        console.log("User Activity Statistics Already Present: " + activityData)
    }
}


function printAthleteInfo() {
    getUserData();
    const id = userData.id;
    const username = userData.username;
    const name = `${userData.firstname} ${userData.lastname}`;
    const premiumStatus = userData.premium
    const creationDate = formatDate(userData.created_at)
    const picture = userData.profile
    const athleteType = userData.athlete_type
    const unit = userData.measurement_preference
    getUserStats(id);
    const maxRide = userStats.biggest_ride_distance
    const rideStats = userStats.all_ride_totals
    const runStats = userStats.all_run_totals
    console.log(`All-Time Cycling Stats: ${rideStats}`)
    console.log(`All-Time Running Stats: ${runStats}`)

}

function formatDate(notFormatted) {
    const date = new Date(notFormatted);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
}
function formatTime(seconds) {
    const time = new Date(seconds);
    time.setSeconds(time);
    return time.toISOString().substr(11, 8)
}

function showViewCount() {
    document.getElementById("hitCount").style.display = "inline"
    document.getElementById("hitCount").style.visibility = "visible"
}