import axios from "axios";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import uuid4 from "uuid4";
const router = Router();

const getManagementToken = async () => {
    const payload = {
        access_key: process.env.MS100_APP_ACCESS_KEY,
        type: "management",
        version: 2,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000),
    };
    return await getToken(payload);
};

const getToken = async (payload: any) => {
    const token = await jwt.sign(payload, process.env.MS100_APP_SECRET, {
        algorithm: "HS256",
        expiresIn: "0.5h",
        jwtid: uuid4(),
    });
    return token;
};

const formUrl = () => {
    const url = `${process.env.MS100_APIURL}/`;
    return url;
};

const getRawResource = async (resourcePath: string) => {
    const token = await getManagementToken();
    let url = formUrl();
    url += resourcePath;

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response;
};

const getSessionRoomID = async (sessionID: string) => {
    const path = `rooms?name=${sessionID}`;
    let response: any;
    try {
        response = await getRawResource(path);

        const room = response.data.data?.find((element: any) => element.name === sessionID);
        if (room?.name == sessionID) {
            return room.id;
        } else {
            return null;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
};

const createAppToken = async (roomDetails: any) => {
    const payload: any = {
        access_key: process.env.MS100_APP_ACCESS_KEY,
        room_id: roomDetails.roomId,
        user_id: roomDetails.userId,
        role: roomDetails.role,
        type: "app",
    };

    const token = getToken(payload);
    return token;
};

const generateToken = async (roomDetails: any) => {
    const usertoken = await createAppToken(roomDetails);

    const returnObj = {
        appToken: usertoken,
        roomId: roomDetails.roomId,
    };
    return returnObj;
};

router.post("/create-room", async (req: Request, res: Response, next: NextFunction) => {
    const roomId = await getSessionRoomID(req.body.sessionID);

    if (roomId !== null) {
        const roomDetails = {
            roomId: roomId,
            userId: req.body.userID,
            role: "user",
        };
        return res.status(200).json({ token: await generateToken(roomDetails) });
    } else {
        const data: any = {
            name: String(req.body.sessionID),
            description: `Room for user`,
            region: process.env.region,
        };
        const roomTemplateId = process.env.ROOM_TEMPLATE_ID;
        roomTemplateId ? (data["template_id"] = roomTemplateId) : data;

        const path = `rooms`;
        const token = await getManagementToken();
        let url = formUrl();
        url += path;

        const contentType = "application/json";

        const requestBody = JSON.stringify(data);

        const headers: any = {
            "Content-Type": contentType,
        };

        headers.Authorization = `Bearer ${token}`;

        try {
            const result: any = await axios.post(url, requestBody, {
                headers: headers,
            });
            if (result.name == String(req.body.sessionID)) {
                const roomDetails: any = {
                    roomId: result.id,
                    userId: req.body.userID,
                    role: "user",
                };
                return res.status(200).json({ token: await generateToken(roomDetails) });
            }
        } catch (e) {
            console.log(e);
        }

        return res.status(500).json({ error: "An error occurred while creating room" });
    }
});

router.post("/get-token", async (req: Request, res: Response, next: NextFunction) => {
    const { userId, roomId } = req.body;

    const payload: any = {
        access_key: process.env.MS100_APP_ACCESS_KEY,
        room_id: roomId,
        user_id: userId,
        role: "user",
        type: "app",
    };

    try {
        const token = await getToken(payload);
        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while generating token" });
    }
});

// Export the router
export default router;
