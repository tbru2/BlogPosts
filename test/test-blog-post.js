const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("blog-post", function(){

    before(function(){
        return runServer();
    });

    after(function(){
        return closeServer();
    });

    it("should list items on GET", function(){

        return chai
            .request(app)
            .get("/blog-posts")
            .then(function(res){
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a("array");
                expect(res.body.length).to.be.at.least(1);

                const expectedKeys = ['author', 'title', 'content', 'id'];
                res.body.forEach(function(item){
                    expect(item).to.include.keys(expectedKeys);
                });
            });

    });

    it("should add an item on POST", function(){
        const newItem = {title : "Meow", content : "Meow Meow", author : "A Cat" };

        return chai 
            .request(app)
            .post("/blog-posts")
            .send(newItem)
            .then(function(res){
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a("object");
                expect(res.body).to.include.keys("id", "author", "title", "content", "publishDate");
                expect(res.body.id).to.not.equal(null);

                expect(res.body).to.deep.equal(
                    Object.assign(newItem, {id : res.body.id, publishDate : res.body.publishDate })
                );
            });
    });

    it("should update items on PUT", function(){
        const updateData = {
            author : "A Cat",
            title : "Purr",
            content : "Purr Purr",
        };

        return(
            chai
                .request(app)
                .get("/blog-posts")
                .then(function(res){
                    updateData.id = res.body[0].id;
                    return chai
                        .request(app)
                        .put(`/blog-posts/${updateData.id}`)
                        .send(updateData);
                })
                .then(function(res){
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.deep.equal(
                        Object.assign(updateData, {publishDate : res.body.publishDate})
                    );   
                })
        );
    });

    it("should delete items on DELETE", function(){
        return(
            chai
                .request(app)
                .get("/blog-posts")
                .then(function(res){
                    return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
                })
                .then(function(res){
                    expect(res).to.have.status(204);
                })
        )
    })
});