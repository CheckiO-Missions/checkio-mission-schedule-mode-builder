//Don't change it
requirejs(['ext_editor_io2', 'jquery_190', 'raphael_210'],
    function (extIO, $, rr) {

        function scheduleModeBuilder(dataInput, dataAnswer) {
            
            const [periods, mode] = dataInput;
            modeDescr = {
                1: "m 1: earliest + shortest", 2: "m 2: earliest + longest",
                3: "m 3: total length + number tasks", 4: "m 4: number tasks + total length"
            }
            
            const colorDark = "#294270";
            const colorOrange = "#FABA00";
            const colorBlue = "#8FC7ED";

            const cellLenMult = 2.5;
            const cellHigh = cellLenMult * 10;
            const indent = 10;

            const attrRect = {"stroke": colorDark, "stroke-width": 1, "fill": colorBlue};
            const attrRectPath = { "stroke": colorDark, "stroke-width": 1, "fill": colorOrange };
            
            // fill array and map with tasks, converted to minutes
            const times = new Map();
            const perMins = new Array();
            for (const period of periods) {
                const [start, end] = period.split("-");
                const [h1, m1] = start.split(":");
                const [h2, m2] = end.split(":");
                const startMins = parseInt(h1) * 60 + parseInt(m1);
                const endMins = parseInt(h2) * 60 + parseInt(m2);
                perMins.push([startMins, endMins]);
                times.set("".concat(startMins, endMins), period);
            }

            // sort array of tasks by earliest start + shortest duration
            perMins.sort((a, b) => {

                if (a[0] < b[0]) {return -1}
                    else if (a[0] > b[0]) {return 1}

                const diffA = a[1] - a[0];
                const diffB = b[1] - b[0];

                if (diffA < diffB) {return -1}
                    else {return 1}
            });

            const minMin = perMins[0][0];
            const maxMin = perMins[perMins.length - 1][1];
            const totalMin = maxMin - minMin;

            // distributing tasks among "rows"
            const rows = new Array();
            for (const [s, e] of perMins){
                var count = 0;
                while (count < rows.length){
                    const lastPer = rows[count].length - 1;
                    if (s - minMin >= rows[count][lastPer][1]) {break};
                    count++;
                }
                if (count < rows.length){rows[count].push([s - minMin, e - minMin])}
                    else {rows.push([[s - minMin, e - minMin]])}
            }

            const sizeX = totalMin * cellLenMult + indent * 3;
            const sizeY = rows.length * cellHigh + indent * 6;

            this.draw = function(dom) {
                paper = Raphael(dom, sizeX, sizeY);
                // writing mode
                paper.text(sizeX / 2, indent, modeDescr[mode]);
                // drawing scale 
                paper.path(`M${indent} ${indent * 3.5}H${totalMin * cellLenMult + indent}`).attr({ "stroke": colorDark });
                // drawing vertical lines
                for (let i = minMin; i <= maxMin; i++){
                    const rem = i % 60;
                    if (i % 10) { continue }
                    const rems = {0: 19, 10: 32, 20: 32, 30: 27, 40: 32, 50: 32}
                    paper.path(`M${indent + (i - minMin) * cellLenMult} ${indent * 3.5}V${rems[rem]}`).attr({ "stroke": colorDark })
                }   
                // drawing tasks as rectangles
                for (var i = 0; i < rows.length; i++){
                    const shiftY = i * cellHigh;
                    for (const [s, e] of rows[i]) {
                        paper.rect(s*cellLenMult + indent, shiftY + indent*4, (e - s)*cellLenMult, cellHigh).attr(dataAnswer.includes(times.get("".concat(s + minMin, e + minMin))) ? attrRectPath : attrRect);
                    }
                }
            }
        };
        var io = new extIO({
            animation: function ($expl, data) {
                var canvas = new scheduleModeBuilder(data.in, data.ext.answer);
                canvas.draw($expl[0])
            }
        });
        io.start()
    }
);

