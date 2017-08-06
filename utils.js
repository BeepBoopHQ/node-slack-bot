module.exports = {
    getWeeklyMatchups: function(weekNum) {
        var matchupString = '```Matchups for week ' + weekNum + ':\n';
        switch(weekNum) {
            case 1:
                matchupString += `
                    Thu Sep 7 @ 5:30 PM - Chiefs at Patriots\n
                    Sun Sep 10 @ 10:00 AM - Cardinals at Lions\n
                                 10:00 AM - Falcons at Bears\n
                                 10:00 AM - Ravens at Bengals\n
                                 10:00 AM - Jaguars at Texans\n
                                 10:00 AM - Jets at Bills\n
                                 10:00 AM - Raiders at Titans\n
                                 10:00 AM - Eagles at Redskins\n
                                 10:00 AM - Steelers at Browns\n
                                 10:00 AM - Buccaneers at Dolphins\n
                                 1:05 PM - Colts at Rams\n
                                 1:25 PM - Panthers at 49ers\n
                                 1:25 PM - Seahawks at Packers\n
                                 5:30 PM - Giants at Cowboys\n
                    Mon Sep 11 @ 4:10 PM - Saints at Vikings\n
                                 7:20 PM - Chargers at Broncos\n
                `;
                break;
        }

        return  matchupString + '```';
    }
}