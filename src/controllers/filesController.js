import db from "../models/index.cjs"

const File = db.File;

export const getTicketsPhotos = async (req, res) => {
    try {
        const ticketId = req.params.ticketId
         console.log("Recebendo ticketId:", ticketId);
        const files = await File.findAll({
            where: { ticketId: ticketId }
        })

        res.status(200).json({message: files})
    } catch (error) {
        res.status(500).json({message: "Erro interno, tente novamente"})
        console.error("ERRO: ", error)
    }
}