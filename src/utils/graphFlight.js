import Graph from 'graphology';
import { formatTime } from './formatTime.js';

const { MultiGraph } = Graph;

function createMultiGraph(flights) {
    const multiGraph = new MultiGraph();

    // Tambahkan node unik
    const uniqueNodes = new Set(flights.flatMap(flight => [
        flight.departureTerminal.airport.cityCode,
        flight.arrivalTerminal.airport.cityCode
    ]));
    uniqueNodes.forEach(node => multiGraph.addNode(node));

    // Tambahkan edges dengan informasi detail
    flights.forEach(flight => {
        const departureCityCode = flight.departureTerminal.airport.cityCode;
        const arrivalCityCode = flight.arrivalTerminal.airport.cityCode;

        multiGraph.addEdge(departureCityCode, arrivalCityCode, {
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
        });
    });

    return multiGraph;
}

function findAllPaths(graph, start, end, path = [], visited = new Set()) {
    path = [...path, start];
    visited.add(start);

    if (start === end) {
        return [path];
    }

    let paths = [];

    graph.outNeighbors(start).forEach(neighbor => {
        if (!visited.has(neighbor)) {
            const newPaths = findAllPaths(graph, neighbor, end, path, new Set(visited));
            paths.push(...newPaths);
        }
    });

    return paths;
}

function findValidFlights(flights, source, target) {
    return flights
        .filter(flight => flight.departureTerminal.airport.cityCode === source && flight.arrivalTerminal.airport.cityCode === target)
}

function isValidFlightSequence(flights) {
    for (let i = 1; i < flights.length; i++) {
        const prevArrival = new Date(flights[i - 1].arrivalTime); // Waktu tiba penerbangan sebelumnya
        const currDeparture = new Date(flights[i].departureTime); // Waktu berangkat penerbangan saat ini
        if ((currDeparture - prevArrival) / (1000 * 60) < 60) { // Selisih kurang dari 1 jam
            return false;
        }
    }
    return true;
}

function generateFlightCombinations(flightLists) {
    if (flightLists.length === 0) return [[]];

    const [firstList, ...remainingLists] = flightLists;
    const restCombinations = generateFlightCombinations(remainingLists);

    return firstList.flatMap(flight =>
        restCombinations.map(combo => [flight, ...combo])
    );
}

function mapFlightData(flights, schedule, seatClass, depCity, arrCity) {
    const multiGraph = createMultiGraph(flights);
    const paths = findAllPaths(multiGraph, depCity, arrCity);

    const processedPaths = paths.map((path) => {
        const flightDetails = path.slice(0, -1).map((node, i) => {
            let validFlights = findValidFlights(flights, node, path[i + 1]);
            return validFlights;
        });

        const allFlightCombinations = generateFlightCombinations(flightDetails);

        return allFlightCombinations
            .filter(isValidFlightSequence)
            .map(flightCombo => ({
                path,
                flights: flightCombo
            }));
    }).flat();

    const result = processedPaths.map((pathInfo) => {
        let totalPrice = 0;
        let totalDuration = 0;
        let delay = 0;
        const flightsOnPath = pathInfo.flights;
        flightsOnPath.forEach((flight, index) => {
            totalPrice += flight.price;
            totalDuration += flight.estimatedDuration;
            if (index > 0) {
                const prevArrival = new Date(flightsOnPath[index - 1].arrivalTime);
                const currDeparture = new Date(flight.departureTime);
                delay += (currDeparture - prevArrival) / 3600000; // Calculate delay in hours
            }
        });

        const formatFlight = flightsOnPath.map(flight => {
            const departureTimeJakarta = formatTime(flight.departureTime);
            const arrivalTimeJakarta = formatTime(flight.arrivalTime);

            return {
                flightId: flight.id,
                flightNum: flight.flightNum,
                airline: {
                    name: flight.airline.name,
                    image: flight.airline.image
                },
                departure: {
                    airport: flight.departureTerminal.airport.name,
                    city: {
                        code: flight.departureTerminal.airport.city.code,
                        name: flight.departureTerminal.airport.city.name
                    },
                    time: departureTimeJakarta.time,
                    date: departureTimeJakarta.date,
                    terminal: flight.departureTerminal.name
                },
                arrival: {
                    airport: flight.arrivalTerminal.airport.name,
                    city: {
                        code: flight.arrivalTerminal.airport.city.code,
                        name: flight.arrivalTerminal.airport.city.name
                    },
                    time: arrivalTimeJakarta.time,
                    date: arrivalTimeJakarta.date,
                    terminal: flight.arrivalTerminal.name
                },
                estimatedDuration: flight.estimatedDuration,
                facility: flight.facility,
                price: flight.price,
            }
        });

        return {
            flightDate: formatTime(schedule).date,
            estimatedDuration: `${totalDuration} Jam`,
            departureTime: pathInfo.flights[0].departureTime,
            arrivalTime: pathInfo.flights.at(-1).arrivalTime,
            seatClass,
            price: `Rp ${totalPrice.toLocaleString()}`,
            isTransit: flightsOnPath.length > 1,
            delayTransit: `${delay} Jam`,
            flights: formatFlight,
        };
    });

    return result;
};

export default mapFlightData;