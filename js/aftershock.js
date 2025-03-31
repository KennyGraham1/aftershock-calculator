      let m1, m2, m3, a, b, c, p;
      let mag;

      function loadQuake(cFunction) {
        let quakeID = document.getElementById("QuakeID").value;
        let patt = new RegExp("[^0-9a-z]");
        if (patt.test(quakeID) == true) {
          alert("invalid QuakeID:" + quakeID);
          return;
        }

        let QuakeURL =
          "https://api.geonet.org.nz/quake/" +
          document.getElementById("QuakeID").value;
        document.getElementById("mag").value = "";
        document.getElementById("quakeTime").value = "";

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            cFunction(this);
          } else {
            document.getElementById("info").innerHTML = "";
          }
        };
        xhttp.open("GET", QuakeURL, true);
        xhttp.send();
      }

      function getQuake(xhttp) {
        if (xhttp.responseText.indexOf("magnitude") < 1) {
          alert("Quake not found");
        } else {
          let myQuake = JSON.parse(xhttp.responseText);
          let d = new Date();
          let n = d.toISOString();
          mag = myQuake.features[0].properties.magnitude;
          document.getElementById("mag").value = mag;
          document.getElementById("quakeTime").value =
            myQuake.features[0].properties.time;
          d.setDate(myQuake.features[0].properties.time);
          document.getElementById("startTime").value = n;

          m1 = Math.round(mag - 0.5);
          if (m1 > 1) {
            m2 = Math.round(mag - 0.5) - 1;
          }
          if (m1 > 2) {
            m3 = Math.round(mag - 0.5) - 2;
          }
          document.getElementById("M1").value = m1;
          document.getElementById("M2").value = m2;
          document.getElementById("M3").value = m3;
          document.getElementById("doAfters").disabled = false;
        }
      }

      
      function formatPercentage(value) {
        // This code defines a helper function formatPercentage() that 
        // takes a percentage value as its argument and returns a formatted 
        // string. The if-else statements are replaced with a single return 
        // statement that checks whether the value is greater than 99, less 
        // than 1, or between 1 and 99, and formats the string accordingly. 
        // The formatted values are then assigned back to the original variables.
        if (value > 99) {
          return ">99%";
        } else if (value < 1) {
          return "<1%";
        } else {
          return Math.round(value) + "%";
        }
      }

      function doCalc() {
        mag = document.getElementById("mag").value;
        m1 = document.getElementById("M1").value;
        m2 = document.getElementById("M2").value;
        m3 = document.getElementById("M3").value;

        if (m1 > 8 || m2 >= m1 || m3 >= m2) {
          alert(
            "Magnitude ranges should be in ascending order (e.g. 5,4,3) and no larger than 8"
          );
          return;
        }

        let quakeTime = new Date(document.getElementById("quakeTime").value);
        let aftershockStartTime = new Date(document.getElementById("startTime").value);

        if (quakeTime > aftershockStartTime) {
          alert("Start Time must be after Quake Time");
          return;
        }

        if (parseInt(document.getElementById("duration_d1").value) < 0||parseInt(document.getElementById("duration_d1").value) > 720) {
          alert("Duration must be 0-720");
          return;
        }
        if (parseInt(document.getElementById("duration_d2").value) < 0||parseInt(document.getElementById("duration_d2").value) > 720) {
          alert("Duration must be 0-720");
          return;
        }
        if (parseInt(document.getElementById("duration_d3").value) < 0||parseInt(document.getElementById("duration_d3").value) > 720) {
          alert("Duration must be 0-720");
          return;
        }
        if (mag >= 10) {
          alert("Initial Quake MAG too large! Please enter a number<10");
          return;
        }

        document.getElementById("qID").innerHTML =
          document.getElementById("QuakeID").value;
        document.getElementById("Range1").innerHTML = "M" + m1.toString() + "+";
        document.getElementById("Range2").innerHTML =
          "M" + Math.round(m2).toString() + "-M" + m1.toString() + "";
        document.getElementById("Range3").innerHTML =
          "M" + Math.round(m3).toString() + "-M" + m2.toString() + "";

        a = parseFloat(document.getElementById("a").value);
        b = parseFloat(document.getElementById("b").value);
        c = parseFloat(document.getElementById("c").value);
        p = parseFloat(document.getElementById("p").value);

        let rangeStartFromQuakeTime = (aftershockStartTime.valueOf() - quakeTime.valueOf()) / (1000 * 60 * 60 * 24); //days and parts there of between the start date and the quaketime
     
        // This for first forecast time
        let rangeEndFromQuakeTime_d1 = rangeStartFromQuakeTime + parseInt(document.getElementById("duration_d1").value);
        let fOmoriIntegral_d1 =
          (Math.pow(rangeEndFromQuakeTime_d1 + c, 1 - p) - Math.pow(rangeStartFromQuakeTime + c, 1 - p)) / (1 - p);


        let vNabuNZ1_d1 = Math.pow(10, a + b * (mag - (m1-0.05))) * fOmoriIntegral_d1;
        let vNabuNZ2_d1 = Math.pow(10, a + b * (mag - (m2-0.05))) * fOmoriIntegral_d1;
        let vNabuNZ3_d1 = Math.pow(10, a + b * (mag - (m3-0.05))) * fOmoriIntegral_d1;

        //Average number
        document.getElementById("within_d1").innerHTML =
          "within " + document.getElementById("duration_d1").value + " days";
        // Change the averages. If between 1 and 99, we want two significant figures
        // If less than 1, we want one significant figure,If larger than 99 then 
        // round to nearest integer
        vNabuNZ1_d1 = (vNabuNZ1_d1 >= 100) ? Math.round(vNabuNZ1_d1) : vNabuNZ1_d1.toPrecision((vNabuNZ1_d1 < 1) ? 1 : 2);

        document.getElementById("M1R_d1").innerHTML = vNabuNZ1_d1;
        vDif_d1 = vNabuNZ2_d1 - vNabuNZ1_d1;
        vDif_d1 = (vDif_d1 >= 100) ? Math.round(vDif_d1) : vDif_d1.toPrecision((vDif_d1 < 1) ? 1 : 2);
        document.getElementById("M2R_d1").innerHTML = vDif_d1.toLocaleString();
   
        
        vDif_d1 = vNabuNZ3_d1 - vNabuNZ2_d1;
        vDif_d1 = (vDif_d1 >= 100) ? Math.round(vDif_d1) : vDif_d1.toPrecision((vDif_d1 < 1) ? 1 : 2);
        document.getElementById("M3R_d1").innerHTML = vDif_d1.toLocaleString();


        let p1_d1 = 100 * (1 - Math.exp(-vNabuNZ1_d1));
        let p2_d1 = 100 * (1 - Math.exp(-(vNabuNZ2_d1 - vNabuNZ1_d1)));
        let p3_d1 = 100 * (1 - Math.exp(-(vNabuNZ3_d1 - vNabuNZ2_d1)));

        //probabilities
        // For the  probability round to the nearest integer and add % sign
        // If percentage smaller than 1, write "<1%"
        // If percentage larger than 99% than write ">99%"

        p1_d1 = formatPercentage(p1_d1);
        p2_d1 = formatPercentage(p2_d1);
        p3_d1 = formatPercentage(p3_d1);

        document.getElementById("M1P_d1").innerHTML = p1_d1;
        document.getElementById("M2P_d1").innerHTML = p2_d1;
        document.getElementById("M3P_d1").innerHTML = p3_d1;

        let p1U_d1 = qpois_sue(0.975, vNabuNZ1_d1);
        let p1L_d1 = qpois_sue(0.025, vNabuNZ1_d1);
        let p2U_d1 = qpois_sue(0.975, vNabuNZ2_d1 - vNabuNZ1_d1);
        let p2L_d1 = qpois_sue(0.025, vNabuNZ2_d1 - vNabuNZ1_d1);
        let p3U_d1 = qpois_sue(0.975, vNabuNZ3_d1 - vNabuNZ2_d1);
        let p3L_d1 = qpois_sue(0.025, vNabuNZ3_d1 - vNabuNZ2_d1);

        // This code uses an array and the map() method to iterate over 
        // the values of the three variables. The expression value || 1 returns 
        // value if it is truthy (i.e., not equal to 0, undefined, null, false, 
        //   NaN, or an empty string), or 1 otherwise.
        [p1U_d1, p2U_d1, p3U_d1] = [p1U_d1, p2U_d1, p3U_d1].map(value => value || 1);


        document.getElementById("M1A_d1").innerHTML =
        Math.round(p1L_d1) + "-" + Math.round(p1U_d1);
        document.getElementById("M2A_d1").innerHTML =
        Math.round(p2L_d1) + "-" + Math.round(p2U_d1);
        document.getElementById("M3A_d1").innerHTML =
        Math.round(p3L_d1) + "-" + Math.round(p3U_d1);

        // This for second forecast time
        let rangeEndFromQuakeTime_d2 = rangeStartFromQuakeTime + parseInt(document.getElementById("duration_d2").value);
        let fOmoriIntegral_d2 =
          (Math.pow(rangeEndFromQuakeTime_d2 + c, 1 - p) - Math.pow(rangeStartFromQuakeTime + c, 1 - p)) / (1 - p);


        let vNabuNZ1_d2 = Math.pow(10, a + b * (mag - (m1-0.05))) * fOmoriIntegral_d2;
        let vNabuNZ2_d2 = Math.pow(10, a + b * (mag - (m2-0.05))) * fOmoriIntegral_d2;
        let vNabuNZ3_d2 = Math.pow(10, a + b * (mag - (m3-0.05))) * fOmoriIntegral_d2;

        //Average number
        document.getElementById("within_d2").innerHTML =
          "within " + document.getElementById("duration_d2").value + " days";
        // Change the averages. If between 1 and 99, we want two significant figures
        // If less than 1, we want one significant figure,If larger than 99 then 
        // round to nearest integer
        vNabuNZ1_d2 = (vNabuNZ1_d2 >= 100) ? Math.round(vNabuNZ1_d2) : vNabuNZ1_d2.toPrecision((vNabuNZ1_d2 < 1) ? 1 : 2);

        document.getElementById("M1R_d2").innerHTML = vNabuNZ1_d2;
        vDif_d2 = vNabuNZ2_d2 - vNabuNZ1_d2;
        vDif_d2 = (vDif_d2 >= 100) ? Math.round(vDif_d2) : vDif_d2.toPrecision((vDif_d2 < 1) ? 1 : 2);
        document.getElementById("M2R_d2").innerHTML = vDif_d2.toLocaleString();
   
        
        vDif_d2 = vNabuNZ3_d2 - vNabuNZ2_d2;
        vDif_d2 = (vDif_d2 >= 100) ? Math.round(vDif_d2) : vDif_d2.toPrecision((vDif_d2 < 1) ? 1 : 2);
        document.getElementById("M3R_d2").innerHTML = vDif_d2.toLocaleString();


        let p1_d2 = 100 * (1 - Math.exp(-vNabuNZ1_d2));
        let p2_d2 = 100 * (1 - Math.exp(-(vNabuNZ2_d2 - vNabuNZ1_d2)));
        let p3_d2 = 100 * (1 - Math.exp(-(vNabuNZ3_d2 - vNabuNZ2_d2)));

        //probabilities
        // For the  probability round to the nearest integer and add % sign
        // If percentage smaller than 1, write "<1%"
        // If percentage larger than 99% than write ">99%"

        p1_d2 = formatPercentage(p1_d2);
        p2_d2 = formatPercentage(p2_d2);
        p3_d2 = formatPercentage(p3_d2);

        document.getElementById("M1P_d2").innerHTML = p1_d2;
        document.getElementById("M2P_d2").innerHTML = p2_d2;
        document.getElementById("M3P_d2").innerHTML = p3_d2;

        let p1U_d2 = qpois_sue(0.975, vNabuNZ1_d2);
        let p1L_d2 = qpois_sue(0.025, vNabuNZ1_d2);
        let p2U_d2 = qpois_sue(0.975, vNabuNZ2_d2 - vNabuNZ1_d2);
        let p2L_d2 = qpois_sue(0.025, vNabuNZ2_d2 - vNabuNZ1_d2);
        let p3U_d2 = qpois_sue(0.975, vNabuNZ3_d2 - vNabuNZ2_d2);
        let p3L_d2 = qpois_sue(0.025, vNabuNZ3_d2 - vNabuNZ2_d2);

        // This code uses an array and the map() method to iterate over 
        // the values of the three variables. The expression value || 1 returns 
        // value if it is truthy (i.e., not equal to 0, undefined, null, false, 
        //   NaN, or an empty string), or 1 otherwise.
        [p1U_d2, p2U_d2, p3U_d2] = [p1U_d2, p2U_d2, p3U_d2].map(value => value || 1);


        document.getElementById("M1A_d2").innerHTML =
        Math.round(p1L_d2) + "-" + Math.round(p1U_d2);
        document.getElementById("M2A_d2").innerHTML =
        Math.round(p2L_d2) + "-" + Math.round(p2U_d2);
        document.getElementById("M3A_d2").innerHTML =
        Math.round(p3L_d2) + "-" + Math.round(p3U_d2);

        // This for third forecast time
        let rangeEndFromQuakeTime_d3 = rangeStartFromQuakeTime + parseInt(document.getElementById("duration_d3").value);
        let fOmoriIntegral_d3 =
          (Math.pow(rangeEndFromQuakeTime_d3 + c, 1 - p) - Math.pow(rangeStartFromQuakeTime + c, 1 - p)) / (1 - p);


        let vNabuNZ1_d3 = Math.pow(10, a + b * (mag - (m1-0.05))) * fOmoriIntegral_d3;
        let vNabuNZ2_d3 = Math.pow(10, a + b * (mag - (m2-0.05))) * fOmoriIntegral_d3;
        let vNabuNZ3_d3 = Math.pow(10, a + b * (mag - (m3-0.05))) * fOmoriIntegral_d3;

        //Average number
        document.getElementById("within_d3").innerHTML =
          "within " + document.getElementById("duration_d3").value + " days";
        // Change the averages. If between 1 and 99, we want two significant figures
        // If less than 1, we want one significant figure,If larger than 99 then 
        // round to nearest integer
        vNabuNZ1_d3 = (vNabuNZ1_d3 >= 100) ? Math.round(vNabuNZ1_d3) : vNabuNZ1_d3.toPrecision((vNabuNZ1_d3 < 1) ? 1 : 2);

        document.getElementById("M1R_d3").innerHTML = vNabuNZ1_d3;
        vDif_d3 = vNabuNZ2_d3 - vNabuNZ1_d3;
        vDif_d3 = (vDif_d3 >= 100) ? Math.round(vDif_d3) : vDif_d3.toPrecision((vDif_d3 < 1) ? 1 : 2);
        document.getElementById("M2R_d3").innerHTML = vDif_d3.toLocaleString();
   
        
        vDif_d3 = vNabuNZ3_d3 - vNabuNZ2_d3;
        vDif_d3 = (vDif_d3 >= 100) ? Math.round(vDif_d3) : vDif_d3.toPrecision((vDif_d3 < 1) ? 1 : 2);
        document.getElementById("M3R_d3").innerHTML = vDif_d3.toLocaleString();


        let p1_d3 = 100 * (1 - Math.exp(-vNabuNZ1_d3));
        let p2_d3 = 100 * (1 - Math.exp(-(vNabuNZ2_d3 - vNabuNZ1_d3)));
        let p3_d3 = 100 * (1 - Math.exp(-(vNabuNZ3_d3 - vNabuNZ2_d3)));

        //probabilities
        // For the  probability round to the nearest integer and add % sign
        // If percentage smaller than 1, write "<1%"
        // If percentage larger than 99% than write ">99%"

        p1_d3 = formatPercentage(p1_d3);
        p2_d3 = formatPercentage(p2_d3);
        p3_d3 = formatPercentage(p3_d3);

        document.getElementById("M1P_d3").innerHTML = p1_d3;
        document.getElementById("M2P_d3").innerHTML = p2_d3;
        document.getElementById("M3P_d3").innerHTML = p3_d3;

        let p1U_d3 = qpois_sue(0.975, vNabuNZ1_d3);
        let p1L_d3 = qpois_sue(0.025, vNabuNZ1_d3);
        let p2U_d3 = qpois_sue(0.975, vNabuNZ2_d3 - vNabuNZ1_d3);
        let p2L_d3 = qpois_sue(0.025, vNabuNZ2_d3 - vNabuNZ1_d3);
        let p3U_d3 = qpois_sue(0.975, vNabuNZ3_d3 - vNabuNZ2_d3);
        let p3L_d3 = qpois_sue(0.025, vNabuNZ3_d3 - vNabuNZ2_d3);

        // This code uses an array and the map() method to iterate over 
        // the values of the three variables. The expression value || 1 returns 
        // value if it is truthy (i.e., not equal to 0, undefined, null, false, 
        //   NaN, or an empty string), or 1 otherwise.
        [p1U_d3, p2U_d3, p3U_d3] = [p1U_d3, p2U_d3, p3U_d3].map(value => value || 1);


        document.getElementById("M1A_d3").innerHTML =
        Math.round(p1L_d3) + "-" + Math.round(p1U_d3);
        document.getElementById("M2A_d3").innerHTML =
        Math.round(p2L_d3) + "-" + Math.round(p2U_d3);
        document.getElementById("M3A_d3").innerHTML =
        Math.round(p3L_d3) + "-" + Math.round(p3U_d3);
            
        
      }

      function clearResults(zone) {
        document.getElementById("Range1").innerHTML = "Mag range 1";
        document.getElementById("Range2").innerHTML = "Mag range 2";
        document.getElementById("Range3").innerHTML = "Mag range 3";
        document.getElementById("info").innerHTML = "";
        document.getElementById("qID").innerHTML = "";
        document.getElementById("M1R_d1").innerHTML = "";
        document.getElementById("M2R_d1").innerHTML = "";
        document.getElementById("M3R_d1").innerHTML = "";
        document.getElementById("M1A_d1").innerHTML = "";
        document.getElementById("M2A_d1").innerHTML = "";
        document.getElementById("M3A_d1").innerHTML = "";
        document.getElementById("M1P_d1").innerHTML = "";
        document.getElementById("M2P_d1").innerHTML = "";
        document.getElementById("M3P_d1").innerHTML = "";
        document.getElementById("within_d1").innerHTML = "within nn days";
        document.getElementById("M1R_d2").innerHTML = "";
        document.getElementById("M2R_d2").innerHTML = "";
        document.getElementById("M3R_d2").innerHTML = "";
        document.getElementById("M1A_d2").innerHTML = "";
        document.getElementById("M2A_d2").innerHTML = "";
        document.getElementById("M3A_d2").innerHTML = "";
        document.getElementById("M1P_d2").innerHTML = "";
        document.getElementById("M2P_d2").innerHTML = "";
        document.getElementById("M3P_d2").innerHTML = "";
        document.getElementById("within_d2").innerHTML = "within nn days";
        document.getElementById("M1R_d3").innerHTML = "";
        document.getElementById("M2R_d3").innerHTML = "";
        document.getElementById("M3R_d3").innerHTML = "";
        document.getElementById("M1A_d3").innerHTML = "";
        document.getElementById("M2A_d3").innerHTML = "";
        document.getElementById("M3A_d3").innerHTML = "";
        document.getElementById("M1P_d3").innerHTML = "";
        document.getElementById("M2P_d3").innerHTML = "";
        document.getElementById("M3P_d3").innerHTML = "";
        document.getElementById("within_d3").innerHTML = "within nn days";
        if (zone == "1") {
          if (document.getElementById("nz").checked == true) {
            document.getElementById("b").value = 1.03;
            document.getElementById("a").value = -1.59;
            document.getElementById("c").value = 0.04;
            document.getElementById("p").value = 1.07;
            document.getElementById("a").disabled = true;
            document.getElementById("b").disabled = true;
            document.getElementById("c").disabled = true;
            document.getElementById("p").disabled = true;
          }
          if (document.getElementById("sz").checked == true) {
            document.getElementById("b").value = 1.0;
            document.getElementById("a").value = -1.97;
            document.getElementById("c").value = 0.018;
            document.getElementById("p").value = 0.92;
            document.getElementById("a").disabled = true;
            document.getElementById("b").disabled = true;
            document.getElementById("c").disabled = true;
            document.getElementById("p").disabled = true;
          }
          if (document.getElementById("cm").checked == true) {
            document.getElementById("a").disabled = false;
            document.getElementById("b").disabled = false;
            document.getElementById("c").disabled = false;
            document.getElementById("p").disabled = false;
          }
        }
      }

      // see https://www.lexifi.com/blog/quant/efficient-simulation-method-poisson-distribution/

      function qpois_sue(p, lambda) {
        let inc = Math.exp(-1 * lambda);
        let n = 0;
        let sum = inc;
        count = 1000;

  
        while (sum < p && count > 0) {
          n = n + 1;
          inc = (inc * lambda) / n;
          sum = sum + inc;
          count = count - 1;
        }

        return n;
      }
